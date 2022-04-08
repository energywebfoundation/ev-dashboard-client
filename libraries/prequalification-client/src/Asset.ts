import { Wallet } from 'ethers';
import { IRoleDefinition, RegistrationTypes } from 'iam-client-lib';
import { IamClientLibFactory } from './IamClientLibFactory';

export class Asset {
  private readonly _logPrefix: string;
  private readonly _did: string;
  private readonly _wallet: Wallet; // Need wallet as iam-client-lib needs priv key...
  private readonly _iamClientLibFactory: IamClientLibFactory;

  public constructor(did: string, wallet: Wallet, iamClientLibFactory: IamClientLibFactory) {
    this._did = did;
    this._wallet = wallet;
    this._iamClientLibFactory = iamClientLibFactory;
    this._logPrefix = `[Asset] ${this._did}`;
  }

  public async requestPrequalification({ role }: { role: IPrequalificationRole }): Promise<void> {
    console.log(`${this._logPrefix} is requestingPrequalification`);

    const { claimsService, cacheClient } = await this._iamClientLibFactory.create({
      privateKey: this._wallet.privateKey
    });

    const roleDef = await cacheClient.getRoleDefinition(role.roleName);
    if (!roleDef) {
      throw Error(`role ${role.roleName} not known to cache server`);
    }
    const claimData = {
      claimType: role.roleName,
      claimTypeVersion: (roleDef as IRoleDefinition).version
    };

    console.log(`${this._logPrefix} is creating claim request`, {
      claim: JSON.stringify(claimData)
    });

    await claimsService.createClaimRequest({
      claim: claimData,
      registrationTypes: [RegistrationTypes.OffChain]
    });

    console.log(`${this._logPrefix} claim request created`);
  }

  public async publishPublicClaim(token: string): Promise<string> {
    const { claimsService } = await this._iamClientLibFactory.create({
      privateKey: this._wallet.privateKey
    });
    const ipfsUrl = await claimsService.publishPublicClaim({
      claim: {
        token
      }
    });
    console.log(`${this._logPrefix} published claim to DID Document`);
    return ipfsUrl || 'No IPFS URL returned';
  }

  public async checkForClaimsToPublish(): Promise<void> {
    const { claimsService, cacheClient } = await this._iamClientLibFactory.create({
      privateKey: this._wallet.privateKey
    });
    const issuedClaims = await claimsService.getClaimsBySubject({
      did: this._did,
      isAccepted: true
    });
    console.log(`${this._logPrefix} found ${issuedClaims.length} claims available on the cache-server`);
    const didDoc = await cacheClient.getDidDocument(this._did, true);
    console.log(
      `${this._logPrefix} found ${
        didDoc.service.filter((s) => s.claimType !== undefined).length
      } role claims in asset DID Document`
    );
    for (const issuedClaim of issuedClaims) {
      if (didDoc.service.filter((s) => s.id === issuedClaim.id).length < 1) {
        console.log(
          `${this._logPrefix} claim with id ${issuedClaim.id} found on cache-server but not found in DID Document`
        );
        console.log(`${this._logPrefix} publishing ${issuedClaim.id} with role ${issuedClaim.claimType}`);
        console.log(`claim jwt is ${issuedClaim.issuedToken}`);
        await claimsService.publishPublicClaim({ claim: { token: issuedClaim.issuedToken } });
        console.log(`${this._logPrefix} published claim to DID Document`);
      }
    }
  }
}

export interface IPrequalificationRole {
  roleName: string;
  issuerRoleName: string;
}
