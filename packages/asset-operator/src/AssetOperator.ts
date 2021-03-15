import { DID } from "./document-creation/DID"
import { keyManagerClient } from "./document-creation/SignerProvider"
import { assetDB } from "./registration/AssetDB"
import { AssetRegistrar } from "./registration/AssetRegistrar"
import { OperatorKeyService } from "./services/OperatorKeyService"

/**
 * Provides an API for AssetOperators to enable their assets to participate in the ev-dashboard.
 */
export class AssetOperator {

  public static async registerAsset(address: string, uid: string) {
    const operatorKeys = OperatorKeyService.getOperatorKeys()
    const registrar = new AssetRegistrar(assetDB, operatorKeys)
    await registrar.saveInEvRegistry(address, uid)
  }

  public static async createDIDDocument(address: string) {
    const operatorKeys = OperatorKeyService.getOperatorKeys()
    const did = new DID(keyManagerClient, operatorKeys)
    await did.createDocument(address)
  }

}