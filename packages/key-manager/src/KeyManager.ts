import * as sqlite3 from "better-sqlite3"
import { Wallet } from "ethers"
import { ISignerProvider } from "@ev-dashboard-client/signer-provider-interface"
import { IKeyPair } from "./IKeyPair"

export class KeyManager implements ISignerProvider {

    private db: sqlite3.Database

    constructor(name: string) {
        this.db = sqlite3.default(name)
        this.db.prepare("CREATE TABLE IF NOT EXISTS dids (id INTEGER PRIMARY KEY, did TEXT, private_key TEXT)").run()
    }

    public async getSignerForDID(did: string): Promise<Wallet | undefined> {
        const keyPair = this.getKeyPair(did)
        if (!keyPair) {
          return
        }
        return new Wallet(keyPair.privateKey)
    }

    /**
     * @returns the DID of the generated keypair
     */
    public generateKeyPair(): string {
        const wallet = Wallet.createRandom()
        const did = `did:ethr:${wallet.address}`
        this.setKeyPair({did, privateKey: wallet.privateKey})
        return did
    }

    private getKeyPair(did: string): IKeyPair | undefined {
        const keypair = this.db.prepare("SELECT * FROM dids WHERE did = ?").get(did)
        if (!keypair) {
            return
        }
        return {
            did: keypair.did,
            privateKey: keypair.private_key
        }
    }

    private setKeyPair(keyPair: IKeyPair): void {
        this.db
            .prepare("INSERT INTO dids (did, private_key) VALUES (?,?)")
            .run(keyPair.did, keyPair.privateKey)
    }


}
