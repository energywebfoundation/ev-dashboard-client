import * as sqlite3 from "better-sqlite3"
import { IAssetIdentity } from "./IAssetIdentity"

export class AssetDB {

    private db: sqlite3.Database

    constructor(name: string) {
        this.db = sqlite3.default(name)
        this.db.prepare("CREATE TABLE IF NOT EXISTS assets (id INTEGER PRIMARY KEY, uid TEXT, did TEXT)").run()
    }

    public getAssetIdentity(did: string): IAssetIdentity | undefined {
        const asset = this.db.prepare("SELECT * FROM assets WHERE did = ?").get(did)
        if (!asset) {
            return
        }
        return {
            uid: asset.uid,
            did: asset.did,
        }
    }

    public setAssetIdentity(asset: IAssetIdentity): void {
        this.db
            .prepare("INSERT INTO assets (uid, did) VALUES (?,?)")
            .run(asset.uid, asset.did)
    }
}
