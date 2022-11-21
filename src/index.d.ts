import { Web3Provider, JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { BigNumberish } from "@ethersproject/bignumber";
type Provider = Web3Provider | JsonRpcProvider;
declare class LicenseClient {
    signer: JsonRpcSigner;
    provider: Provider;
    licenseClient: Contract;
    /**
   * @constructor
   * @param {Provider} provider - instance of Web3Provider or JsonRpcProvider
   * @param {number} chainId - chainId of the network to be used
   */
    constructor(provider: Provider, chainId: number);
    /**
   * This function checks if user has purchased the license
   * @param {string} signingMessage - message to be signed by user
   * @param {BigNumberish} projectId - ID of the project
   * @returns {boolean} - true if user has purchased the license
   */
    checkLicense(signingMessage: string, projectId: BigNumberish): Promise<boolean>;
    /**
     * Purchase license with native matic token
     * @param {BigNumberish} projectId - ID of the project
     * @param {string} recipient - address of the recipient
     * @returns {Promise<ContractTransaction>} - instance of ContractTransaction
     */
    purchaseLicense(projectId: BigNumberish, recipient: string): Promise<ContractTransaction>;
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
    purchaseLicenseWithToken(projectId: BigNumberish, recipient: string, tokenAddress: string): Promise<ContractTransaction>;
}
export default LicenseClient;
