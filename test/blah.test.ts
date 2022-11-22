import { ethers, providers } from "ethers";
import ValistLicenseClient from "../src/index";


describe('Valist License Client Initialization', () => {
  it('should initialize client without error', () => {
    const provider = new providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
    const valistLicenseClient = new ValistLicenseClient(provider, 8001);
    expect(valistLicenseClient).toBeDefined();
  });
});
