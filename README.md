### Valist Software License Client SDK

This is an un-official Valist Software License Client SDK. It allows you to interact with the Valist Software License contract. It is written in Typescript and can be used in Node.js or in the browser.

#### Installation

```bash
npm install valist-software-license-client
```

#### Usage

```typescript
import ValistLicenseClient from 'valist-software-license-client';

const provider  = new ethers.providers.JsonRpcProvider('http://localhost:8545');
// or window ethereum provider
// const provider = new ethers.providers.Web3Provider(window.ethereum);
const chainId = 8001; // supported chainIds are: 8001, 137

const valistLicenseClient = new ValistLicenseClient(provider, chainId);
```

#### Methods

##### checkLicencse

```typescript
const signingMessage = "I am signing this message to prove that I own this wallet address";
const projectId = 23;

const license = await valistLicenseClient.getLicense(signingMessage, projectId);

```

##### purchaseLicense (Native token)
  
  ```typescript
  const projectId = 21;
  const receipt = "0x...";

  const purchaseLicenseTx = await valistLicenseClient.purchaseLicense(projectId, recipient);

  // wait for transaction to be mined
  await purchaseLicenseTx.wait();
  ```

  ##### purchaseLicenseWithToken (with token of your choice)
  
  ```typescript
  const tokenAddress = "0x..."; // Example: USDC address
  const projectId = 21;
  const recipient = "0x..."; // recipient address to receive the license NFT

  const purchaseLicenseTx = await valistLicenseClient.purchaseLicenseWithToken(tokenAddress, projectId, recipient);

  // wait for transaction to be mined
  await purchaseLicenseTx.wait();
  ```
