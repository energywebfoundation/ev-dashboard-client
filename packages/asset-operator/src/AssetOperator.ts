import { Methods } from "@ew-did-registry/did"
import { abi1056, address1056 } from "@ew-did-registry/did-ethr-resolver"
import { IResolverSettings, ProviderTypes } from "@ew-did-registry/did-resolver-interface"
import { DID } from "./document-creation/DID"
import { keyManagerClient } from "./document-creation/SignerProvider"
import { assetDB } from "./registration/AssetDB"
import { AssetRegistrar } from "./registration/AssetRegistrar"
import { EvRegistry } from "./registration/contracts/ev-registry"
import { OperatorKeyService } from "./services/OperatorKeyService"

/**
 * Provides an API for AssetOperators to enable their assets to participate in the ev-dashboard.
 */
export class AssetOperator {
  private readonly resolverSettings: IResolverSettings

  constructor(private readonly providerUrl: string, private readonly evRegistryAddress) {
    this.resolverSettings = {
      provider: {
        uriOrInfo: providerUrl,
        type: ProviderTypes.HTTP
      },
      method: Methods.Erc1056,
      abi: abi1056,
      address: address1056
    }
  }

  public async registerAsset(address: string, uid: string) {
    const operatorKeys = OperatorKeyService.getOperatorKeys()
    const evRegistry = new EvRegistry(operatorKeys, this.providerUrl, this.evRegistryAddress )
    const registrar = new AssetRegistrar(assetDB, evRegistry)
    await registrar.saveInEvRegistry(address, uid)
  }

  public async createDIDDocument(address: string) {
    const operatorKeys = OperatorKeyService.getOperatorKeys()
    const did = new DID(keyManagerClient, operatorKeys, this.resolverSettings)
    await did.createDocument(address)
  }

}