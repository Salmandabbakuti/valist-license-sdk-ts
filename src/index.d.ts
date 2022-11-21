import { Contract, providers, ethers } from 'ethers';
type Provider = providers.Web3Provider | providers.JsonRpcProvider;
declare class LicenseClient {
    signer: providers.JsonRpcSigner;
    provider: Provider;
    licenseClient: Contract;

    /**
   * @constructor
   * @param {Provider} provider - instance of ethers.providers.Web3Provider or ethers.providers.JsonRpcProvider
   * @param {number} chainId - chainId of the network to be used
   */
    constructor(provider: Provider, chainId: number);
    /**
   * This function checks if user has purchased the license
   * @param {string} signingMessage - message to be signed by user
   * @param {string} projectId - ID of the project
   * @returns {boolean} - true if user has purchased the license
   */
    checkLicense(signingMessage: string, projectId: ethers.BigNumberish): Promise<boolean>;
    /**
     * Purchase license with native matic token
     * @param {string} projectId - ID of the project
     * @param {string} recipient - address of the recipient
     * @returns {Promise<ethers.ContractTransaction>} - instance of ethers.ContractTransaction
     */
    purchaseLicense(projectId: ethers.BigNumberish, recipient: string): Promise<ethers.ContractTransaction>;
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
    purchaseLicenseWithToken(projectId: ethers.BigNumberish, recipient: string, tokenAddress: string): Promise<ethers.ContractTransaction>;
}
export default LicenseClient;
