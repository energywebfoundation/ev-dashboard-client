import { NATS_EXCHANGE_TOPIC } from "iam-client-lib";
import { Client } from "nats";
import { ISignerProvider } from "../../signer-provider-interface/src/ISignerProvider";
import { Asset, PrequalificationRole } from "./Asset";
import { IamClientLibFactory, IamClientLibFactoryParams } from "./IamClientLibFactory";
import { NatsConnection, NatsUrl } from "./NatsConnection";

export class PrequalificationClient {
  private readonly iamClientLibFactory: IamClientLibFactory;

  constructor(iamClientLibFactoryParams: IamClientLibFactoryParams) {
    this.iamClientLibFactory = new IamClientLibFactory(iamClientLibFactoryParams);
  }

  public init({
    signerProvider,
    prequalificationRole,
    natsUrl,
  }: {
    signerProvider: ISignerProvider;
    prequalificationRole: PrequalificationRole;
    natsUrl: NatsUrl;
  }) {
    const createSubscriptions = (natsConnection: Client) => {
      this.initVehiclePrequalificationListener({
        natsClient: natsConnection,
        signerProvider,
        prequalificationRole,
      });
    };
    // tslint:disable-next-line: no-unused-expression
    new NatsConnection({ createSubscriptions, natsUrl });
  }

  private initVehiclePrequalificationListener({
    natsClient,
    signerProvider,
    prequalificationRole,
  }: {
    natsClient: Client;
    signerProvider: ISignerProvider;
    prequalificationRole: PrequalificationRole;
  }) {
    // Listen for prequalification requests
    const PREQUALIFICATION_REQUEST_TOPIC = "prequalification.exchange";
    natsClient.subscribe(`*.${PREQUALIFICATION_REQUEST_TOPIC}`, async (data) => {
      const json = JSON.parse(data);
      console.log(`[NATS] Received prequalification REQUEST for: ${JSON.stringify(json)}`);
      const assetDID: string = json.did;
      const wallet = await signerProvider.getSignerForDID(assetDID);
      console.log(`[NATS] Queried signer for asset: ${assetDID}`);
      if (!wallet) {
        console.log(`[NATS] No available signer for asset: ${assetDID}`);
        return;
      }
      const asset = new Asset(assetDID, wallet, this.iamClientLibFactory);
      console.log(`[NATS] Requesting prequalification for asset: ${assetDID}`);
      await asset.requestPrequalification({ role: prequalificationRole });
    });

    // Listen for issued prequalification claims
    natsClient.subscribe(`*.${NATS_EXCHANGE_TOPIC}`, async (data) => {
      const message = JSON.parse(data) as IMessage;
      console.log(`[NATS] Received message on claims exchange.`);
      if (!message.issuedToken) {
        console.log(`[NATS] Received message does not contained an issued token`);
        return;
      }
      console.log(`[NATS] Received ISSUED CLAIM: ${JSON.stringify(message)}`);
      const assetDID: string = message.requester;
      const signer = await signerProvider.getSignerForDID(assetDID);
      console.log(`[NATS] Retrieved signer for asset: ${assetDID}`);
      if (!signer) {
        console.log(`[NATS] No stored signer for asset: ${assetDID}`);
        return;
      }
      const asset = new Asset(assetDID, signer, this.iamClientLibFactory);
      console.log(`[NATS] Publishing claim for asset: ${assetDID}`);
      await asset.publishPublicClaim(message.issuedToken);
    });
    console.log("[NATS] Listening for asset claim requests and issued claims");
  }
}

// IMessage is taken from iam-client-lib
// (it should probably be published as a shared interface)
interface IMessage {
  id: string;
  token: string;
  issuedToken?: string;
  requester: string;
  claimIssuer: string[];
  acceptedBy?: string;
}
