import { getDIDFromAddress } from "../utils"
import { AssetDB } from "./AssetDB"
import { EvRegistry } from "./contracts/ev-registry"

export class AssetRegistrar {

  constructor(private readonly assetDB: AssetDB, private readonly evRegistry: EvRegistry) {
  }

  /**
   * Store device entry in EV Registry smart contract (allows participation in ev dashboard application)
   * 
   * @param address asset EWC or Volta address
   * @param uid asset UID used to identify it on OCN
   */
  public async saveInEvRegistry(address: string, uid: string): Promise<void> {
    const did = getDIDFromAddress(address)
    const existent = this.assetDB.getAssetIdentity(did)
    if (existent) {
      console.log("[ASSET] cached, has already been register in EV dashboard")
      return
    } else {
      console.log("[ASSET] not cached, likely hasn't been registered")
    }
    console.log(`[${new Date()}]`, "[EV REGISTRY] adding entry", address, uid)
    await this.evRegistry.addDevice(address, uid)
    console.log(`[EV REGISTRY] Registered asset ${address}`)
    console.log(`[${new Date()}]`, "[ASSET] caching asset", did, uid)
    this.assetDB.setAssetIdentity({
      uid,
      did
    })
  }
}