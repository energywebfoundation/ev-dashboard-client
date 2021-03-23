import { Client, connect } from 'nats';

/**
 * Creates and monitors a NATS connection
 * Event handling code taken from: https://docs.nats.io/developing-with-nats/events/events
 */
export class NatsConnection {
  private static readonly _logPrefix: string = '[NATS Connection]';
  private readonly _createSubscriptions: (Client) => void;
  private readonly _natsUrl: string;
  private _natsClient: Client | undefined;

  public constructor({
    createSubscriptions,
    natsUrl
  }: {
    createSubscriptions: (Client) => void;
    natsUrl: string;
  }) {
    this._createSubscriptions = createSubscriptions;
    this._natsUrl = natsUrl;
  }

  public _connect(): Client {
    const url = this._natsUrl;
    console.log(`[NATS] Connecting to ${url}`);
    this._natsClient = connect({ url: `nats://${url}` });

    this._natsClient.on('error', (err) => {
      console.error(`${NatsConnection._logPrefix} error occured`, err);
      this._reconnect();
    });
    this._natsClient.on('connect', () => {
      console.log(`${NatsConnection._logPrefix} client connected. Creating subscriptions.`);
      this._createSubscriptions(this._natsClient);
    });

    this._natsClient.on('disconnect', () => {
      console.log(`${NatsConnection._logPrefix} client disconnected`);
    });

    this._natsClient.on('reconnecting', () => {
      console.log(`${NatsConnection._logPrefix} client reconnecting`);
    });

    this._natsClient.on('reconnect', () => {
      console.log(`${NatsConnection._logPrefix} client reconnected`);
    });

    this._natsClient.on('close', () => {
      console.log(`${NatsConnection._logPrefix} client closed`);
      this._reconnect();
    });

    this._natsClient.on('permission_error', (err) => {
      console.error(`${NatsConnection._logPrefix} permission_error`, err);
    });
    return this._natsClient;
  }

  private _reconnect(): void {
    console.log(`${NatsConnection._logPrefix} draining and closing client`);
    this._natsClient?.removeAllListeners();
    this._natsClient?.drain();
    this._natsClient?.close();

    // Set timeout to space out reconnection attempts to as to not overwhelm NATS server
    setTimeout(() => {
      console.log(`${NatsConnection._logPrefix} reconnecting client`);
      this._natsClient = this._connect();
    }, 5 * 1000);
  }
}
