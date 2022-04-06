import {
  initWithPrivateKeySigner,
  MessagingMethod,
  setMessagingConfig,
  setCacheConfig,
  CacheClient,
  ClaimsService
} from 'iam-client-lib';

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
  public async create({
    privateKey
  }: {
    privateKey: string;
  }): Promise<{ claimsService: ClaimsService; cacheClient: CacheClient }> {
    const { connectToCacheServer } = await initWithPrivateKeySigner(privateKey, this._params.rpcUrl);

    setMessagingConfig(73799, {
      messagingMethod: MessagingMethod.Nats,
      natsServerUrl: 'http://localhost:9222'
    });

    setCacheConfig(73799, {
      url: 'http://localhost:3000/v1',
      cacheServerSupportsAuth: true
    });

    const { cacheClient, connectToDidRegistry } = await connectToCacheServer();

    const { claimsService } = await connectToDidRegistry();

    return { cacheClient, claimsService };
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IamClientLibFactoryParams {
  cacheServerUrl: string;
  rpcUrl: string;
  chainId: number;
}
