import { ISignerProvider } from "@ev-dashboard-client/signer-provider-interface"
import { Methods } from "@ew-did-registry/did"
import { abi1056, address1056 } from "@ew-did-registry/did-ethr-resolver"
import { ProviderTypes } from "@ew-did-registry/did-resolver-interface"
import { DID } from "./document-creation/DID"
// import { assetDB } from "./registration/AssetDB"
// import { AssetRegistrar } from "./registration/AssetRegistrar"
import { EvRegistry } from "./registration/contracts/ev-registry"
import { Keys } from "@ew-did-registry/keys"

/**
 * Provides an API for AssetOperators to enable their assets to participate in the ev-dashboard.
 */
export class AssetOperator {

  constructor(private readonly operatorKeys: Keys) {
  }
  
  public async registerUser(providerUrl: string, evRegistryAddress: string) {
    const evRegistry = new EvRegistry(this.operatorKeys, providerUrl, evRegistryAddress )
    await evRegistry.addUser()
  }

  public async registerAsset(address: string, uid: string, providerUrl: string, evRegistryAddress: string) {
    const evRegistry = new EvRegistry(this.operatorKeys, providerUrl, evRegistryAddress )
    // const registrar = new AssetRegistrar(assetDB, evRegistry)
    await evRegistry.addDevice(address, uid)
  }

  public async getRegisteredAsset(address: string, providerUrl: string, evRegistryAddress: string) {
    const evRegistry = new EvRegistry(this.operatorKeys, providerUrl, evRegistryAddress )
    return evRegistry.deviceExists(address)
  }

  public async createDIDDocument(address: string, signerProvider: ISignerProvider, providerUrl: string) {
    const resolverSettings = {
      provider: {
        uriOrInfo: providerUrl,
        type: ProviderTypes.HTTP
      },
      method: Methods.Erc1056,
      abi: abi1056,
      address: address1056
    }
    const did = new DID(signerProvider, this.operatorKeys, resolverSettings)
    await did.createDocument(address)
  }

}