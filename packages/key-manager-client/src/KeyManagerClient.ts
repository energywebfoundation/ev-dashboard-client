import { Wallet } from "ethers"
import { KeyManager } from "@ev-dashboard-client/key-manager"
import { ISignerProvider } from "../../signer-provider-interface/src/ISignerProvider"

export class KeyManagerClient implements ISignerProvider {
  private readonly keyManager: KeyManager
  constructor() {
    this.keyManager = new KeyManager("key_manager")
  }

  public async getSignerForDID(did: string): Promise<Wallet | undefined> {
    const keyPair = this.keyManager.getKeyPair(did)
    if (!keyPair) {
      return
    }
    return new Wallet(keyPair.privateKey)
  }
}
