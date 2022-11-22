import { Contract, providers, ethers } from 'ethers';
type Provider = providers.Web3Provider | providers.JsonRpcProvider;
declare class LicenseClient {
    signer: providers.JsonRpcSigner;
    provider: Provider;
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
   * @throws {Error} if connected provider chainId does not match provided chainId
   */
    constructor(provider: Provider, chainId: number);
    /**
   * This function checks if user has purchased the license
   * @param {string} signingMessage - message to be signed by user
   * @param {ethers.BigNumberish} projectId - ID of the project
   * @example const hasPurchased = await licenseClient.checkLicense("I am signing this message", 12);
   * @returns {boolean} - true if user has purchased the license
   */
    checkLicense(signingMessage: string, projectId: ethers.BigNumberish): Promise<boolean>;
    /**
     * Purchase license with native matic token
     * @param {ethers.BigNumberish} projectId - ID of the project
     * @param {string} recipient - address of the recipient
     * @example const tx = await licenseClient.purchaseLicense(12, "0xc49a...");
     * @returns {Promise<ethers.ContractTransaction>} - instance of ethers.ContractTransaction
     */
    purchaseLicense(projectId: ethers.BigNumberish, recipient: string): Promise<ethers.ContractTransaction>;
    /**
     * Purchase license with any supported token
     * @param {ethers.BigNumberish} projectId - ID of the project
     * @param {string} recipient - address of the recipient
     * @param {string} tokenAddress - address of the token contract to be used for purchase
     * @example const tx = await licenseClient.purchaseLicense(12, "0xc49a...", "0x7d1a...");
     * @throws {Error} if token is not approved
     * @throws {Error} if token balance is less than price
     * @throws {Error} if token transfer fails
     * @returns {Promise<ethers.ContractTransaction>} - instance of ethers.ContractTransaction
     */
    purchaseLicenseWithToken(projectId: ethers.BigNumberish, recipient: string, tokenAddress: string): Promise<ethers.ContractTransaction>;
}
export default LicenseClient;
