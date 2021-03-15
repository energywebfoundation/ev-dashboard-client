import { Wallet } from "ethers"
import { KeyManager } from "@ev-dashboard-client/key-manager"
import { ISignerProvider } from "@ev-dashboard-client/signer-provider-interface"

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
