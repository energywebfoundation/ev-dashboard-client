import { CacheServerClient, IAM } from "iam-client-lib"

export class IamClientLibFactory {

    constructor(private readonly params: IamClientLibFactoryParams) {}
    /**
     * Returns an initialized iam-client
     * @param privateKey 
     * @param isForUserClaims 
     */
    public async create({privateKey}: {privateKey: string}) {
        const cacheClient = new CacheServerClient({
            url: this.params.cacheServerUrl
        })

        // Because iam-client-lib is running on the server, the private key is passed in directly
        const iamClient = new IAM({
            privateKey,
            rpcUrl: this.params.rpcUrl,
            chainId: this.params.chainId,
            cacheClient
        })

        // TODO: document why initialization is necessary.
        await iamClient.initializeConnection()
        return iamClient
    }
}

export interface IamClientLibFactoryParams {
    cacheServerUrl: string,
    rpcUrl: string,
    chainId: number,
}