import { Contract, providers, ethers } from 'ethers';
type Provider = providers.Web3Provider | providers.JsonRpcProvider;
declare class LicenseClient {
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
    constructor(provider: Provider, chainId: number);
    /**
   * This function checks if user has purchased the license
   * @param {ethers.BigNumberish} projectId - ID of the project
   * @param {string} signingMessage - message to be signed by user
   * @example const hasPurchased = await licenseClient.checkLicense(12, "I am signing this message");
   * @throws {Error} if connected provider chainId does not match with provided chainId
   * @returns {boolean} - true if user has purchased the license
   */
    checkLicense(projectId: ethers.BigNumberish, signingMessage?: string): Promise<boolean>;
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
    purchaseLicense(projectId: ethers.BigNumberish, recipient: string): Promise<ethers.ContractTransaction>;
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
    purchaseLicenseWithToken(projectId: ethers.BigNumberish, recipient: string, tokenAddress: string): Promise<ethers.ContractTransaction>;
}
export default LicenseClient;
