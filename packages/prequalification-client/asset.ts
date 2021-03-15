import { Wallet } from "ethers"
import { config } from "../../config/config"
import { IamClientLibFactory } from "./iam-client-lib-factory"

export class Asset {
    private readonly logPrefix: string

    constructor(
        private readonly did: string,
        private readonly wallet: Wallet // Need wallet as iam-client-lib needs priv key...
    ) {
        this.logPrefix = `[Asset] ${this.did}`
    }

    public async requestPrequalification() {
        console.log(`${this.logPrefix} is requestingPrequalification`)

        const claimData = {
            fields: [],
            claimType: config.prequalification.prequalifcationRole
        }

        const userIamClient = await IamClientLibFactory.create({
            privateKey: this.wallet.privateKey,
            cacheServerUrl: config.prequalification.user_claims_iam.cacheServerUrl
        })
        console.log(`${this.logPrefix}, retrieving DIDs with role: ${config.prequalification.prequalificationIssuerRole}`)
        const tsoDids = await userIamClient.getRoleDIDs({ namespace: config.prequalification.prequalificationIssuerRole })
        if (tsoDids?.length < 1) {
            console.log(`${this.logPrefix}, no DIDs with issuer role found and so no claim request can be created`)
            return
        }

        console.log(`${this.logPrefix} is creating claim request`, {
            issuer: tsoDids,
            claim: JSON.stringify(claimData)
        })

        const assetIamClient = await IamClientLibFactory.create({
            privateKey: this.wallet.privateKey,
            cacheServerUrl: config.prequalification.asset_claims_iam.cacheServerUrl
        })
        await assetIamClient.createClaimRequest({
            issuer: tsoDids,
            claim: claimData
        })

        console.log(`${this.logPrefix} claim request created`)
    }

    public async publishPublicClaim(token: string): Promise<string | null> {
        const assetIamClient = await IamClientLibFactory.create({
            privateKey: this.wallet.privateKey,
            cacheServerUrl: config.prequalification.asset_claims_iam.cacheServerUrl
        })
        const ipfsUrl = await assetIamClient.publishPublicClaim({ token })
        console.log(`${this.logPrefix} published claim to DID Document`)
        return ipfsUrl
    }
}