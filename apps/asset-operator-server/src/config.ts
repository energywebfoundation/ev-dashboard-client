import convict from 'convict';

convict.addFormat({
  name: 'strict-string',
  validate: (val: string, schema: convict.SchemaObj) => {
    if (val === 'undefined') {
      throw new Error(`a value must be provided for the ${schema.env}`);
    }
  }
});

// eslint-disable-next-line @rushstack/typedef-var
const convictConfig = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  keyManagerDbPath: {
    doc: 'Path and name of keymanager file (e.g. "/mypath/keymanager.db"',
    format: 'strict-string',
    default: 'keymanager.db',
    env: 'KEY_MANAGER_PATH',
    sensitive: true
  },
  assetOperator: {
    operatorKey: {
      doc: 'Private key of the OCN identity of the operator',
      format: 'strict-string',
      default: 'undefined',
      env: 'OCN_IDENTITY',
      sensitive: true
    },
    evRegistry: {
      providerUrl: {
        doc: 'URL to RPC to interact with EV registry smart contract',
        format: 'strict-string',
        default: 'undefined',
        env: 'EV_REGISTRY_PROVIDER'
      },
      address: {
        doc: 'Address of the EV registry smart contract',
        format: 'strict-string',
        default: 'undefined',
        env: 'EV_REGISTRY_ADDRESS'
      }
    },
    didDocument: {
      providerUrl: {
        doc: 'URL to RPC to intract with DID Document persistance',
        format: 'strict-string',
        default: 'undefined',
        env: 'EWC_RPC_URL'
      }
    }
  },
  prequalification: {
    prequalificationIssuerRole: {
      doc: 'Role that can issue prequalification claims',
      format: 'strict-string',
      default: 'undefined',
      env: 'PREQUALIFICATION_ISSUER_ROLE'
    },
    prequalifcationRole: {
      doc: 'Role that is issued to assest when prequalified',
      format: 'strict-string',
      default: 'undefined',
      env: 'PREQUALIFICATION_ROLE'
    },
    providerUrl: {
      doc: 'URL to RPC to add claim to DID Document',
      format: 'strict-string',
      default: 'undefined',
      env: 'EWC_RPC_URL'
    },
    chainId: {
      doc: 'Chain ID of the providerUrl',
      format: Number,
      default: 73799
    },
    userClaimsIam: {
      cacheServerUrl: {
        doc: 'URL to iam-cache-server which has record of user claims.',
        format: 'strict-string',
        default: 'undefined',
        env: 'USER_CACHE_SERVER_URL'
      }
    },
    assetClaimsIam: {
      cacheServerUrl: {
        doc: 'URL to iam-cache-server which facilitates asset claim.',
        format: 'strict-string',
        default: 'undefined',
        env: 'ASSET_CACHE_SERVER_URL'
      },
      natsServerUrl: {
        doc: 'URL of NATS server',
        format: 'strict-string',
        default: 'undefined',
        env: 'NATS_SERVER_URL'
      }
    }
  }
});

const env: string = convictConfig.get('env');
convictConfig.loadFile(`./config/${env}.json`);
convictConfig.validate(); // throws error if config does not conform to schema
// eslint-disable-next-line @rushstack/typedef-var
export const config = convictConfig.getProperties();
