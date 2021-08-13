import { ClaimsIssuer, ClaimsUser, hashes } from '@ew-did-registry/claims';
import { DIDDocumentFull } from '@ew-did-registry/did-document';
import { Operator, withKey, walletPubKey, ethrReg, addressOf } from '@ew-did-registry/did-ethr-resolver';
import { DIDAttribute, RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { Keys } from '@ew-did-registry/keys';
import { IDidStore } from '@ew-did-registry/did-store-interface';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from 'ethers/providers';
import { ISignerProvider } from '@energyweb/ev-signer-interface';
import { Methods } from '@ew-did-registry/did';
import { v4 as uuid } from 'uuid';

const VOLTA_DID_REGISTRY: string = '0xd7CeF70Ba7efc2035256d828d5287e2D285CD1ac';

export class DID {
  private readonly _resolverSettings: RegistrySettings;
  private readonly _signerProvider: ISignerProvider;
  private readonly _operatorKeys: Keys;
  private readonly _provider: JsonRpcProvider;
  private readonly _didStore: IDidStore | undefined;

  public constructor({
    signerProvider,
    operatorKeys,
    providerUrl,
    didStore,
    didRegistryAddress
  }: {
    signerProvider: ISignerProvider;
    operatorKeys: Keys;
    providerUrl: string;
    didStore?: IDidStore;
    didRegistryAddress?: string;
  }) {
    this._signerProvider = signerProvider;
    this._operatorKeys = operatorKeys;
    this._resolverSettings = {
      method: Methods.Erc1056,
      abi: ethrReg.abi,
      address: didRegistryAddress ?? VOLTA_DID_REGISTRY
    };
    this._provider = new JsonRpcProvider(providerUrl);
    this._didStore = didStore;
  }

  public async addClaim(did: string, claimData: object): Promise<void> {
    if (!this._didStore) {
      throw Error('Unable to create claim as didStore/claimsStore not provided');
    }
    // Setup requesting party
    const signer = await this._instantiateSigner(did);
    const connectedSigner = signer.connect(this._provider);
    const requestingIdentity = withKey(connectedSigner, walletPubKey);
    const requestingOperator = new Operator(requestingIdentity, this._resolverSettings);
    const requestingDocument = new DIDDocumentFull(did, requestingOperator);
    const claimsUser = new ClaimsUser(requestingIdentity, requestingDocument, this._didStore);

    // Setup issuing party
    const issuingWallet = new Wallet(this._operatorKeys.privateKey, this._provider);
    const issuingIdentity = withKey(issuingWallet, walletPubKey);
    const issuingOperator = new Operator(issuingIdentity, this._resolverSettings);
    const issuingDocument = new DIDDocumentFull(`did:ethr:${issuingWallet.address}`, issuingOperator);
    const claimsIssuer = new ClaimsIssuer(issuingIdentity, issuingDocument, this._didStore);

    // Request, issue and persist credential
    const token = await claimsUser.createPublicClaim(claimData);
    const issuedToken = await claimsIssuer.issuePublicClaim(token);
    const url = await this._didStore.save(issuedToken);
    await requestingDocument.update(DIDAttribute.ServicePoint, {
      type: DIDAttribute.ServicePoint,
      value: {
        id: uuid(),
        serviceEndpoint: url,
        hash: hashes.SHA256(issuedToken),
        hashAlg: 'SHA256'
      }
    });
  }

  /**
   * Creates a DIDDocument
   */
  public async createDocument(did: string, mintAmount?: number): Promise<void> {
    const signer = await this._instantiateSigner(did);
    const connectedSigner = signer.connect(this._provider);
    const identityOwner = withKey(connectedSigner, walletPubKey);
    console.log(identityOwner.publicKey);
    const operator = new Operator(identityOwner, this._resolverSettings);
    const document = new DIDDocumentFull(did, operator);
    console.log(`[${new Date()}]`, '[DID] minting tokens before did creation', did);
    // send tokens to address so they can create/update their document
    const address = addressOf(did);
    await this._mint(address, mintAmount ?? 0.001);
    console.log(`[${new Date()}]`, '[DID] creating did document', did);
    await document.create();
    console.log(`[${new Date()}]`, `[DID] Created identity for ${did}`);
  }

  /**
   * Create DIDDocument for Operator
   */
  public async createDocumentForOperator(): Promise<void> {
    const connectedSigner = new Wallet(this._operatorKeys.privateKey, this._provider);
    const identityOwner = withKey(connectedSigner, walletPubKey);
    console.log(identityOwner.publicKey);
    const operator = new Operator(identityOwner, this._resolverSettings);
    const did = `did:ethr:${connectedSigner.address}`;
    const document = new DIDDocumentFull(did, operator);
    console.log(`[${new Date()}]`, '[DID] creating did document', did);
    await document.create();
    console.log(`[${new Date()}]`, `[DID] did document created for ${did}`);
  }

  /**
   * Fund asset wallet with minimal EWT
   * @param assetAddress wallet address of asset
   */
  private async _mint(assetAddress: string, valueInEther: number): Promise<void> {
    const wallet = new Wallet(this._operatorKeys.privateKey, this._provider);
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

  private async _instantiateSigner(did: string): Promise<Wallet> {
    const signer = await this._signerProvider.getSignerForDID(did);
    if (!signer) {
      throw Error('Unable to create DID Document as unable to retrieve signer');
    }
    return signer;
  }
}
