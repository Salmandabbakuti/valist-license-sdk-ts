import { Contract, utils, providers, ethers } from 'ethers';

type Provider = providers.Web3Provider | providers.JsonRpcProvider;

const licenseContractABI: ethers.ContractInterface = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function getPrice(address _token, uint256 _projectID) view returns (uint256)",
  "function getPrice(uint256 _projectID) view returns (uint256)",
  "function purchase(uint256 _projectID, address _recipient) payable",
  "function purchase(address _token, uint256 _projectID, address _recipient)"
];

const erc20ABI: ethers.ContractInterface = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

const supportedChainIds: number[] = [80001, 137];

const contractAddresses: { [key: number]: string; } = {
  80001: "0x3cE643dc61bb40bB0557316539f4A93016051b81",
  137: "0x3cE643dc61bb40bB0557316539f4A93016051b81",
};

class LicenseClient {
  signer: providers.JsonRpcSigner;
  provider: Provider;
  chainId: number;
  licenseClient: Contract;

  /**
 * @constructor
 * Intializes the LicenseClient
 * @param {Provider} provider - instance of ethers.providers.Web3Provider or ethers.providers.JsonRpcProvider
 * @param {number} chainId - chainId of the contract to interact with
 * @example 
 * const provider = new ethers.providers.Web3Provider(window.ethereum);
 * const licenseClient = new LicenseClient(provider, 80001);
 * @throws {Error} if provider and/or chainId is not provided
 * @throws {Error} if provided chainId is not supported
 */
  constructor(provider: Provider, chainId: number) {
    if (!provider || !chainId) throw new Error("Valist License SDK: Provider and chainId are required!");
    if (!supportedChainIds.includes(chainId)) throw new Error("Valist License SDK: ChainId is not supported. Supported chainIds are 137, 80001");
    const licenseContractAddress = contractAddresses[chainId];
    this.provider = provider;
    this.chainId = chainId;
    this.signer = provider.getSigner();
    this.licenseClient = new Contract(
      licenseContractAddress,
      licenseContractABI,
      this.signer
    );
    console.log("Valist License SDK: initialized with chainId", chainId);
  }

  /**
 * This function checks if user has purchased the license
 * @param {ethers.BigNumberish} projectId - ID of the project
 * @param {string} signingMessage - message to be signed by user
 * @example const hasPurchased = await licenseClient.checkLicense(12, "I am signing this message");
 * @throws {Error} if connected provider chainId does not match with provided chainId
 * @returns {boolean} - true if user has purchased the license
 */
  async checkLicense(projectId: ethers.BigNumberish, signingMessage: string = "I am signing this messag to authenticate"): Promise<boolean> {
    const { chainId } = await this.provider.getNetwork();
    if (chainId !== this.chainId) throw new Error("Valist License SDK: Provider is connected to a different chainId than one specified in the constructor");
    const signerAddress = await this.signer.getAddress();
    const signature = await this.signer.signMessage(signingMessage);
    const messgeHash = utils.hashMessage(signingMessage);
    const digest = utils.arrayify(messgeHash);
    // const recoveredAddress = utils.verifyMessage(signingMessage, signature);
    const recoveredAddress = utils.recoverAddress(digest, signature);
    if (signerAddress.toLowerCase() !== recoveredAddress.toLowerCase()) throw new Error("Valist License SDK: Invalid signature");
    const balance = await this.licenseClient.balanceOf(signerAddress, projectId);
    return balance.gt(0);
  }

  /**
   * Purchase license with native matic token
   * @param {ethers.BigNumberish} projectId - ID of the project
   * @param {string} recipient - address of the recipient
   * @example const tx = await licenseClient.purchaseLicense(12, "0xc49a...");
   * @throws {Error} if connected provider chainId does not match with provided chainId
   * @throws {Error} if price of the license is 0 which means project license may not exists or sold out
   * @throws {Error} if user does not have enough balance to purchase the license
   * @returns {Promise<ethers.ContractTransaction>} - instance of ethers.ContractTransaction
   */
  async purchaseLicense(projectId: ethers.BigNumberish, recipient: string): Promise<ethers.ContractTransaction> {
    const { chainId } = await this.provider.getNetwork();
    if (chainId !== this.chainId) throw new Error("Valist License SDK: Provider is connected to a different chainId than one specified in the constructor");
    const price = await this.licenseClient["getPrice(uint256)"](projectId);
    if (price.eq(0)) throw new Error("Valist License SDK: License may not exists or sold out for this project");
    const balance = await this.signer.getBalance();
    if (balance.lt(price)) throw new Error("Valist License SDK: Insufficient balance to purchase license");
    const tranaction = await this.licenseClient["purchase(uint256,address)"](projectId, recipient, { value: price });
    return tranaction;
  }

  /**
   * Purchase license with any supported token
   * @param {ethers.BigNumberish} projectId - ID of the project
   * @param {string} recipient - address of the recipient
   * @param {string} tokenAddress - address of the token contract to be used for purchase
   * @example const tx = await licenseClient.purchaseLicense(12, "0xc49a...", "0x7d1a...");
   * @throws {Error} if connected provider chainId does not match with provided chainId
   * @throws {Error} if price of the license is 0 which means project license may not exists or sold out
   * @throws {Error} if token is not approved
   * @throws {Error} if token balance is less than price
   * @throws {Error} if token transfer fails
   * @returns {Promise<ethers.ContractTransaction>} - instance of ethers.ContractTransaction
   */
  async purchaseLicenseWithToken(projectId: ethers.BigNumberish, recipient: string, tokenAddress: string): Promise<ethers.ContractTransaction> {
    const { chainId } = await this.provider.getNetwork();
    if (chainId !== this.chainId) throw new Error("Valist License SDK: Provider is connected to a different chainId than one specified in the constructor");
    const price = await this.licenseClient["getPrice(address,uint256)"](tokenAddress, projectId);
    if (price.eq(0)) throw new Error("Valist License SDK: License may not exists or sold out for this project");
    const tokenContract = new Contract(tokenAddress, erc20ABI, this.signer);
    const tokenBalance = await tokenContract.balanceOf(await this.signer.getAddress());
    if (tokenBalance.lt(price)) throw new Error("Valist License SDK: Insufficient token balance to purchase license");
    const tokenAllowance = await tokenContract.allowance(this.signer.getAddress(), this.licenseClient.address);
    if (tokenAllowance.lt(price)) {
      const approveTx = await tokenContract.approve(this.licenseClient.address, price.sub(tokenAllowance));
      await approveTx.wait();
    }
    const tranaction = await this.licenseClient["purchase(address,uint256,address)"](tokenAddress, projectId, recipient, { value: price });
    return tranaction;
  }
}

export default LicenseClient;
