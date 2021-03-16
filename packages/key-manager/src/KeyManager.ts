import * as sqlite3 from "better-sqlite3"
import { Wallet } from "@ethersproject/wallet"
import { IKeyPair } from "./IKeyPair"

export class KeyManager {

    private db: sqlite3.Database

    constructor(name: string) {
        this.db = sqlite3.default(name)
        this.db.prepare("CREATE TABLE IF NOT EXISTS dids (id INTEGER PRIMARY KEY, did TEXT, private_key TEXT)").run()
    }

    public getKeyPair(did: string): IKeyPair | undefined {
        const keypair = this.db.prepare("SELECT * FROM dids WHERE did = ?").get(did)
        if (!keypair) {
            return
        }
        return {
            did: keypair.did,
            privateKey: keypair.private_key
        }
    }

    public setKeyPair(keyPair: IKeyPair): void {
        this.db
            .prepare("INSERT INTO dids (did, private_key) VALUES (?,?)")
            .run(keyPair.did, keyPair.privateKey)
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

}
