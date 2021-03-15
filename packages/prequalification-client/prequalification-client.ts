import { NATS_EXCHANGE_TOPIC } from "iam-client-lib"
import { Client } from "nats"
import { ISignerProvider } from "../signer-provider-interface/ISignerProvider"
import { Asset } from "./asset"
import { NatsConnection } from "./nats-connection"

export class PrequalificationClient {

    public static init({ signerProvider }: { signerProvider: ISignerProvider }) {
        const createSubscriptions = (natsConnection: Client) => {
            this.initVehiclePrequalificationListener({ natsClient: natsConnection, signerProvider })
        }
        // tslint:disable-next-line: no-unused-expression
        new NatsConnection({ createSubscriptions })
    }

    private static initVehiclePrequalificationListener({ natsClient, signerProvider }:
        { natsClient: Client, signerProvider: ISignerProvider }) {

        // Listen for prequalification requests
        const PREQUALIFICATION_REQUEST_TOPIC = "prequalification.exchange"
        natsClient.subscribe(`*.${PREQUALIFICATION_REQUEST_TOPIC}`, async (data) => {
            const json = JSON.parse(data)
            console.log(`[NATS] Received prequalification REQUEST for: ${JSON.stringify(json)}`)
            const assetDID: string = json.did
            const wallet = await signerProvider.getSignerForDID(assetDID)
            console.log(`[NATS] Queried signer for asset: ${assetDID}`)
            if (!wallet) {
                console.log(`[NATS] No available signer for asset: ${assetDID}`)
                return
            }
            const asset = new Asset(assetDID, wallet)
            console.log(`[NATS] Requesting prequalification for asset: ${assetDID}`)
            await asset.requestPrequalification()
        })

        // Listen for issued prequalification claims
        natsClient.subscribe(`*.${NATS_EXCHANGE_TOPIC}`, async (data) => {
            const message = JSON.parse(data) as IMessage
            console.log(`[NATS] Received message on claims exchange.`)
            if (!message.issuedToken) {
                console.log(`[NATS] Received message does not contained an issued token`)
                return
            }
            console.log(`[NATS] Received ISSUED CLAIM: ${JSON.stringify(message)}`)
            const assetDID: string = message.requester
            const signer = await signerProvider.getSignerForDID(assetDID)
            console.log(`[NATS] Retrieved signer for asset: ${assetDID}`)
            if (!signer) {
                console.log(`[NATS] No stored signer for asset: ${assetDID}`)
                return
            }
            const asset = new Asset(assetDID, signer)
            console.log(`[NATS] Publishing claim for asset: ${assetDID}`)
            await asset.publishPublicClaim(message.issuedToken)
        })
        console.log("[NATS] Listening for asset claim requests and issued claims")
    }
}

// IMessage is taken from iam-client-lib
// (it should probably be published as a shared interface)
interface IMessage {
    id: string
    token: string
    issuedToken?: string
    requester: string
    claimIssuer: string[]
    acceptedBy?: string
}