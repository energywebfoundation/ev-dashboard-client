import { CacheServerClient, IAM } from 'iam-client-lib';

export class IamClientLibFactory {
  private readonly _params: IamClientLibFactoryParams;
  public constructor(params: IamClientLibFactoryParams) {
    this._params = params;
  }
  /**
   * Returns an initialized iam-client
   * @param privateKey
   * @param isForUserClaims
   */
  public async create({ privateKey }: { privateKey: string }): Promise<IAM> {
    const cacheClient = new CacheServerClient({
      url: this._params.cacheServerUrl
    });

    // Because iam-client-lib is running on the server, the private key is passed in directly
    const iamClient = new IAM({
      privateKey,
      rpcUrl: this._params.rpcUrl,
      chainId: this._params.chainId,
      cacheClient
    });

    // TODO: document why initialization is necessary.
    await iamClient.initializeConnection();
    return iamClient;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IamClientLibFactoryParams {
  cacheServerUrl: string;
  rpcUrl: string;
  chainId: number;
}
