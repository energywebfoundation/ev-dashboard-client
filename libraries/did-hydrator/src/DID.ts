import { DIDDocumentFull } from '@ew-did-registry/did-document';
import { abi1056, address1056, Operator } from '@ew-did-registry/did-ethr-resolver';
import { IResolverSettings, ProviderTypes } from '@ew-did-registry/did-resolver-interface';
import { Keys } from '@ew-did-registry/keys';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from 'ethers/providers';
import { ISignerProvider } from '@energyweb/ev-signer-interface';
import { getDIDFromAddress } from './utils';
import { Methods } from '@ew-did-registry/did';

export class DID {
  private readonly _resolverSettings: IResolverSettings;
  private readonly _signerProvider: ISignerProvider;
  private readonly _operatorKeys: Keys;

  public constructor(signerProvider: ISignerProvider, operatorKeys: Keys, providerUrl: string) {
    this._signerProvider = signerProvider;
    this._operatorKeys = operatorKeys;
    this._resolverSettings = {
      provider: {
        uriOrInfo: providerUrl,
        type: ProviderTypes.HTTP
      },
      method: Methods.Erc1056,
      abi: abi1056,
      address: address1056
    };
  }

  /**
   * Creates a DIDDocument
   */
  public async createDocument(address: string): Promise<void> {
    const did = getDIDFromAddress(address);
    const signer = await this._signerProvider.getSignerForDID(did);
    if (!signer) {
      throw Error('Unable to create DID Document as unable to retrieve signer');
    }
    const operator = new Operator(signer, this._resolverSettings);
    const document = new DIDDocumentFull(did, operator);
    console.log(`[${new Date()}]`, '[DID] minting tokens before did creation', did);
    // send tokens to address so they can create/update their document
    await this._mint(address);
    console.log(`[${new Date()}]`, '[DID] creating did document', did);
    await document.create();
    console.log(`[${new Date()}]`, `[DID] Created identity for ${did}`);
  }

  /**
   * Fund asset wallet with minimal EWT
   * @param assetAddress wallet address of asset
   */
  private async _mint(assetAddress: string): Promise<void> {
    const provider = new JsonRpcProvider(this._resolverSettings.provider?.uriOrInfo);
    const wallet = new Wallet(this._operatorKeys.privateKey, provider);
    const valueInEther = 0.001;
    console.log(
      `[${new Date()}]`,
      'creating tx, to:',
      assetAddress,
      'value:',
      valueInEther * 1e18,
      'gasPrice:',
      1
    );
    const tx = await wallet.sendTransaction({
      to: assetAddress,
      value: valueInEther * 1e18 // convert to wei
    });
    console.log(`[${new Date()}]`, 'sending mint tx', tx.hash);
    await tx.wait();
    console.log(`[${new Date()}]`, 'tx confirmed', tx.hash);
    // log remaining balance
    const balance = await wallet.getBalance();
    // get approx. balance for log (ethers bignumber hates big numbers)
    const balanceInEther = (parseInt(balance.toString(), 10) / 1e18).toFixed(3);
    console.log(
      `[${new Date()}]`,
      `[DID] Minted ${valueInEther} for ${assetAddress}. Remaining balance: ${balanceInEther}`
    );
  }
}
