import { Contract, utils, providers, ethers } from 'ethers';

type Provider = providers.Web3Provider | providers.JsonRpcProvider;

const licenseContractAbi: ethers.ContractInterface = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function getPrice(address _token, uint256 _projectID) view returns (uint256)",
  "function getPrice(uint256 _projectID) view returns (uint256)",
  "function purchase(uint256 _projectID, address _recipient) payable",
  "function purchase(address _token, uint256 _projectID, address _recipient)"
];

const erc20Abi: ethers.ContractInterface = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const chainIds = [8001, 137];

const contractAddresses: { [key: number]: string; } = {
  8001: "0x3cE643dc61bb40bB0557316539f4A93016051b81",
  137: "0x3cE643dc61bb40bB0557316539f4A93016051b81",
};

class LicenseClient {
  signer: providers.JsonRpcSigner;
  provider: Provider;
  licenseClient: Contract;

  /**
 * @constructor
 * @param {Provider} provider - instance of ethers.providers.Web3Provider or ethers.providers.JsonRpcProvider
 * @param {number} chainId - chainId of the network to be used
 */
  constructor(provider: Provider, chainId: number) {
    // check if entered chainId is supported
    if (!provider || !chainId) throw new Error("SDK: Provider and chainId are required!");
    if (!chainIds.includes(chainId)) throw new Error("SDK: ChainId is not supported. Supported chainIds are 137, 8001");
    provider.getNetwork().then((network) => {
      if (chainId !== network.chainId) throw new Error("SDK: Provider chainId does not match with the chainId passed!");
    });
    console.log("SDK: initialized with chainId", chainId);
    const licenseContractAddress = contractAddresses[chainId];
    console.log(provider);
    this.provider = provider;
    this.signer = provider.getSigner();
    this.licenseClient = new Contract(
      licenseContractAddress,
      licenseContractAbi,
      this.signer
    );
  }

  /**
 * This function checks if user has purchased the license
 * @param {string} signingMessage - message to be signed by user
 * @param {string} projectId - ID of the project
 * @returns {boolean} - true if user has purchased the license
 */
  async checkLicense(signingMessage: string, projectId: ethers.BigNumberish): Promise<boolean> {
    const signerAddress = await this.signer.getAddress();
    const signature = await this.signer.signMessage(signingMessage);
    const messgeHash = utils.hashMessage(signingMessage);
    const digest = utils.arrayify(messgeHash);
    // const recoveredAddress = utils.verifyMessage(signingMessage, signature);
    const recoveredAddress = utils.recoverAddress(digest, signature);
    if (signerAddress.toLowerCase() !== recoveredAddress.toLowerCase()) throw new Error("Invalid signature");
    const balance = await this.licenseClient.balanceOf(signerAddress, projectId);
    return balance > 0;
  }

  /**
   * Purchase license with native matic token
   * @param {string} projectId - ID of the project
   * @param {string} recipient - address of the recipient
   * @returns {Promise<ethers.ContractTransaction>} - instance of ethers.ContractTransaction
   */
  async purchaseLicense(projectId: ethers.BigNumberish, recipient: string): Promise<ethers.ContractTransaction> {
    const price = await this.licenseClient["getPrice(uint256)"](projectId);
    const tranaction = await this.licenseClient["purchase(uint256,address)"](projectId, recipient, { value: price });
    return tranaction;
  }

  /**
   * Purchase license with any supported token
   * @param {string} projectId - ID of the project
   * @param {string} recipient - address of the recipient
   * @param {string} tokenAddress - address of the token contract to be used for purchase
   * @returns {Promise<ethers.ContractTransaction>} - instance of ethers.ContractTransaction
   * @throws Error if token is not approved
   * @throws Error if token balance is less than price
   * @throws Error if token transfer fails
   */
  async purchaseLicenseWithToken(projectId: ethers.BigNumberish, recipient: string, tokenAddress: string): Promise<ethers.ContractTransaction> {
    const price = await this.licenseClient["getPrice(address,uint256)"](tokenAddress, projectId);
    const tokenContract = new Contract(tokenAddress, erc20Abi, this.signer);
    const tokenBalance = await tokenContract.balanceOf(this.signer.getAddress());
    if (tokenBalance < price) throw new Error("Insufficient token balance");
    const approveTx = await tokenContract.approve(this.licenseClient.address, price);
    await approveTx.wait();
    const tranaction = await this.licenseClient["purchase(address,uint256,address)"](tokenAddress, projectId, recipient, { value: price });
    return tranaction;
  }
}

export default LicenseClient;
