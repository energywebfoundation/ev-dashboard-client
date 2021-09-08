import { providers, Wallet } from 'ethers';
import { deployContracts, GANACHE_PORT, didResolver } from '@energyweb/ev-contract-deployer';
import { DID } from '../src/DID';
import { ISignerProvider } from '@energyweb/ev-signer-interface';
import { Methods } from '@ew-did-registry/did';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import DIDRegistry from '@ew-did-registry/did-registry';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import {
  ethrReg,
  Operator,
  signerFromKeys,
  walletPubKey,
  withKey,
  withProvider
} from '@ew-did-registry/did-ethr-resolver';
import { Keys } from '@ew-did-registry/keys';

const operatorWallet = Wallet.createRandom();
const assetWallet = Wallet.createRandom();

export const rpcUrl = `http://localhost:${GANACHE_PORT}`;

class MockSignerProvider implements ISignerProvider {
  public async getSignerForDID(): Promise<Wallet> {
    return assetWallet;
  }
  public async getAllSigners(): Promise<Wallet[]> {
    return [assetWallet];
  }
}

// Test can take a while as they are quite a few transactions and chain reads
const timeout = 20000;

describe('EvRegistry tests', () => {
  beforeAll(async () => {
    await deployContracts(operatorWallet.privateKey);
  });

  test(
    'can create document and add claim',
    async () => {
      console.log('success');
      const signerProvider = new MockSignerProvider();
      const keys = new Keys({ privateKey: operatorWallet.privateKey });
      const ipfsUrl = 'https://ipfs.infura.io:5001/api/v0/';
      const ipfsStore = new DidStore(ipfsUrl);
      const did = new DID({
        signerProvider,
        operatorKeys: keys,
        providerUrl: rpcUrl,
        didRegistryAddress: didResolver.settings.address,
        didStore: ipfsStore
      });
      const assetDID = `did:ethr:${assetWallet.address}`;
      await did.createDocument(assetDID, 0.005);
      await did.createDocumentForOperator();
      const createdDoc = await didResolver.read(assetDID);
      expect(createdDoc.publicKey.length).toEqual(1);

      const endpoint = 'http://operator.org#device-data';
      await did.addClaim(assetDID, { endpoint: endpoint });
      const docWithClaim = await didResolver.read(assetDID);
      expect(docWithClaim.service.length).toEqual(1);

      const { abi: abi1056 } = ethrReg;
      const registrySettings: RegistrySettings = {
        abi: abi1056,
        address: didResolver.settings.address,
        method: Methods.Erc1056
      };
      const provider = new providers.JsonRpcProvider(rpcUrl);
      const verifierKeys = new Keys({
        privateKey: '37cd773efb8cd99b0f509ec118df8e9c6d6e5e22b214012a76be215f77250b9e',
        publicKey: '02335325b9d16aa046ea7275537d9aced84ed3683a7969db5f836b0e6d62770d1e'
      });
      const verifierAddress = '0x6C30b191A96EeE014Eb06227D50e9FB3CeAbeafd';
      const verifierDid = `did:${Methods.Erc1056}:${verifierAddress}`;
      const verifierOwner = withKey(withProvider(signerFromKeys(verifierKeys), provider), walletPubKey);
      const verifierOperator = new Operator(verifierOwner, registrySettings);
      const verifierRegistry = new DIDRegistry(verifierKeys, verifierDid, verifierOperator, ipfsStore);
      const claimsVerifier = verifierRegistry.claims.createClaimsVerifier();
      // Expect that will throw exception if fails
      await claimsVerifier.verifyPublicProof(docWithClaim.service[0].serviceEndpoint);
    },
    timeout
  );
});
