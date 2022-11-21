import { Web3Provider, JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { arrayify } from '@ethersproject/bytes';
import { hashMessage } from '@ethersproject/hash';
import { recoverAddress } from '@ethersproject/transactions';
import { Contract, ContractTransaction, ContractInterface } from "@ethersproject/contracts";
import { BigNumberish } from "@ethersproject/bignumber";


type Provider = Web3Provider | JsonRpcProvider;

const licenseContractABI: ContractInterface = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function getPrice(address _token, uint256 _projectID) view returns (uint256)",
  "function getPrice(uint256 _projectID) view returns (uint256)",
  "function purchase(uint256 _projectID, address _recipient) payable",
  "function purchase(address _token, uint256 _projectID, address _recipient)"
];

const erc20ABI: ContractInterface = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const supportedChainIds: number[] = [8001, 137];

const contractAddresses: { [key: number]: string; } = {
  8001: "0x3cE643dc61bb40bB0557316539f4A93016051b81",
  137: "0x3cE643dc61bb40bB0557316539f4A93016051b81",
};

class LicenseClient {
  signer: JsonRpcSigner;
  provider: Provider;
  licenseClient: Contract;

  /**
 * @constructor
 * @param {Provider} provider - instance of Web3Provider or JsonRpcProvider
 * @param {number} chainId - chainId of the network to be used
 */
  constructor(provider: Provider, chainId: number) {
    // check if entered chainId is supported
    if (!provider || !chainId) throw new Error("Valist License SDK: Provider and chainId are required!");
    if (!supportedChainIds.includes(chainId)) throw new Error("Valist License SDK: ChainId is not supported. Supported chainIds are 137, 8001");
    provider.getNetwork().then((network) => {
      if (chainId !== network.chainId) throw new Error("Valist License SDK: Provider chainId does not match with the chainId passed!");
    });
    console.log("Valist License SDK: initialized with chainId", chainId);
    const licenseContractAddress = contractAddresses[chainId];
    console.log(provider);
    this.provider = provider;
    this.signer = provider.getSigner();
    this.licenseClient = new Contract(
      licenseContractAddress,
      licenseContractABI,
      this.signer
    );
  }

  /**
 * This function checks if user has purchased the license
 * @param {string} signingMessage - message to be signed by user
 * @param {BigNumberish} projectId - ID of the project
 * @returns {boolean} - true if user has purchased the license
 */
  async checkLicense(signingMessage: string, projectId: BigNumberish): Promise<boolean> {
    const signerAddress = await this.signer.getAddress();
    const signature = await this.signer.signMessage(signingMessage);
    const digest = arrayify(hashMessage(signingMessage));
    const recoveredAddress = recoverAddress(digest, signature);
    if (signerAddress.toLowerCase() !== recoveredAddress.toLowerCase()) throw new Error("Valist License SDK: Invalid signature");
    const balance = await this.licenseClient.balanceOf(signerAddress, projectId);
    return balance > 0;
  }

  /**
   * Purchase license with native matic token
   * @param {BigNumberish} projectId - ID of the project
   * @param {string} recipient - address of the recipient
   * @returns {Promise<ContractTransaction>} - instance of ContractTransaction
   */
  async purchaseLicense(projectId: BigNumberish, recipient: string): Promise<ContractTransaction> {
    const price = await this.licenseClient["getPrice(uint256)"](projectId);
    const tranaction = await this.licenseClient["purchase(uint256,address)"](projectId, recipient, { value: price });
    return tranaction;
  }

  /**
   * Purchase license with any supported token
   * @param {BigNumberish} projectId - ID of the project
   * @param {string} recipient - address of the recipient
   * @param {string} tokenAddress - address of the token contract to be used for purchase
   * @returns {Promise<ContractTransaction>} - instance of ContractTransaction
   * @throws Error if token is not approved
   * @throws Error if token balance is less than price
   * @throws Error if token transfer fails
   */
  async purchaseLicenseWithToken(projectId: BigNumberish, recipient: string, tokenAddress: string): Promise<ContractTransaction> {
    const price = await this.licenseClient["getPrice(address,uint256)"](tokenAddress, projectId);
    const tokenContract = new Contract(tokenAddress, erc20ABI, this.signer);
    const tokenBalance = await tokenContract.balanceOf(this.signer.getAddress());
    if (tokenBalance < price) throw new Error("Valist License SDK: Insufficient token balance");
    const approveTx = await tokenContract.approve(this.licenseClient.address, price);
    await approveTx.wait();
    const tranaction = await this.licenseClient["purchase(address,uint256,address)"](tokenAddress, projectId, recipient, { value: price });
    return tranaction;
  }
}

export default LicenseClient;
