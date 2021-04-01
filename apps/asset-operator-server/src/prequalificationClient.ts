import { PrequalificationClient, IamClientLibFactoryParams } from '@energyweb/ev-prequalification';
import { config } from './config';
import { keyManager } from './keyManager';

export const initPrequalificationClient = (): void => {
  const iamClientParams: IamClientLibFactoryParams = {
    cacheServerUrl: config.prequalification.assetClaimsIam.cacheServerUrl,
    rpcUrl: config.prequalification.providerUrl,
    chainId: config.prequalification.chainId
  };
  const prequalificationClient = new PrequalificationClient(iamClientParams);
  prequalificationClient.init({
    signerProvider: keyManager,
    prequalificationRole: {
      issuerRoleName: config.prequalification.prequalificationIssuerRole,
      roleName: config.prequalification.prequalifcationRole
    },
    natsUrl: config.prequalification.assetClaimsIam.natsServerUrl
  });
};
