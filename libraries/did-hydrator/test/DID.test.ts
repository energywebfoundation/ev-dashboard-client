import { Wallet } from 'ethers';
import { deployContracts, GANACHE_PORT, didResolver } from '@energyweb/ev-contract-deployer';
import { DID } from '../src/DID';
import { ISignerProvider } from '@energyweb/ev-signer-interface';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { Keys } from '@ew-did-registry/keys';

const operatorWallet = Wallet.createRandom();
const assetWallet = Wallet.createRandom();

export const rpcUrl = `http://localhost:${GANACHE_PORT}`;

class MockSignerProvider implements ISignerProvider {
  public async getSignerForDID(did: string): Promise<Wallet> {
    return assetWallet;
  }
}

describe('EvRegistry tests', () => {
  beforeAll(async () => {
    await deployContracts(operatorWallet.privateKey);
  });

  test('can create document and ', async () => {
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
    const createdDoc = await didResolver.read(assetDID);
    expect(createdDoc.publicKey.length).toEqual(1);

    const endpoint = 'http://operator.org#device-data';
    await did.addClaim(assetDID, { endpoint: endpoint });
    const docWithClaim = await didResolver.read(assetDID);
    expect(docWithClaim.service.length).toEqual(1);
  });
});
