import { Wallet } from 'ethers';
import { ENSNamespaceTypes, IRoleDefinition } from 'iam-client-lib';
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

    const iamClient = await this._iamClientLibFactory.create({
      privateKey: this._wallet.privateKey
    });

    console.log(`${this._logPrefix}, retrieving DIDs with role: ${role.roleName}`);
    const tsoDids = await iamClient.getRoleDIDs({ namespace: role.issuerRoleName });
    if (tsoDids?.length < 1) {
      console.log(
        `${this._logPrefix}, no DIDs with issuer role found and so no claim request can be created`
      );
      return;
    }

    const roleDef = await iamClient.getDefinition({
      type: ENSNamespaceTypes.Roles,
      namespace: role.roleName
    });
    if (!roleDef) {
      throw Error(`role ${role.roleName} not known to cache server`);
    }
    const claimData = {
      fields: [],
      claimType: role.roleName,
      claimTypeVersion: (roleDef as IRoleDefinition).version
    };

    console.log(`${this._logPrefix} is creating claim request`, {
      issuer: tsoDids,
      claim: JSON.stringify(claimData)
    });

    await iamClient.createClaimRequest({
      issuer: tsoDids,
      claim: claimData
    });

    console.log(`${this._logPrefix} claim request created`);
  }

  public async publishPublicClaim(token: string): Promise<string> {
    const assetIamClient = await this._iamClientLibFactory.create({
      privateKey: this._wallet.privateKey
    });
    const ipfsUrl = await assetIamClient.publishPublicClaim({ token });
    console.log(`${this._logPrefix} published claim to DID Document`);
    return ipfsUrl;
  }
}

export interface IPrequalificationRole {
  roleName: string;
  issuerRoleName: string;
}
