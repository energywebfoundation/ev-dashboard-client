import { Wallet } from 'ethers';
import { IamClientLibFactory } from './IamClientLibFactory';

export class Asset {
  private readonly logPrefix: string;

  constructor(
    private readonly did: string,
    private readonly wallet: Wallet, // Need wallet as iam-client-lib needs priv key...
    private readonly iamClientLibFactory: IamClientLibFactory
  ) {
    this.logPrefix = `[Asset] ${this.did}`;
  }

  public async requestPrequalification({ role }: { role: PrequalificationRole }) {
    console.log(`${this.logPrefix} is requestingPrequalification`);

    const claimData = {
      fields: [],
      claimType: role.roleName
    };

    const iamClient = await this.iamClientLibFactory.create({
      privateKey: this.wallet.privateKey
    });

    console.log(`${this.logPrefix}, retrieving DIDs with role: ${role.roleName}`);
    const tsoDids = await iamClient.getRoleDIDs({ namespace: role.issuerRoleName });
    if (tsoDids?.length < 1) {
      console.log(`${this.logPrefix}, no DIDs with issuer role found and so no claim request can be created`);
      return;
    }

    console.log(`${this.logPrefix} is creating claim request`, {
      issuer: tsoDids,
      claim: JSON.stringify(claimData)
    });

    await iamClient.createClaimRequest({
      issuer: tsoDids,
      claim: claimData
    });

    console.log(`${this.logPrefix} claim request created`);
  }

  public async publishPublicClaim(token: string): Promise<string | null> {
    const assetIamClient = await this.iamClientLibFactory.create({
      privateKey: this.wallet.privateKey
    });
    const ipfsUrl = await assetIamClient.publishPublicClaim({ token });
    console.log(`${this.logPrefix} published claim to DID Document`);
    return ipfsUrl;
  }
}

export interface PrequalificationRole {
  roleName: string;
  issuerRoleName: string;
}
