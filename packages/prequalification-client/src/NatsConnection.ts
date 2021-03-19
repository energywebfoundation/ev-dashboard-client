import { Client, connect } from 'nats';

export interface INatsUrl {
  host: string;
  port: number;
}

/**
 * Creates and monitors a NATS connection
 * Event handling code taken from: https://docs.nats.io/developing-with-nats/events/events
 */
export class NatsConnection {
  private static readonly _logPrefix: string = '[NATS Connection]';
  private readonly _createSubscriptions: (Client) => void;
  private readonly _natsUrl: INatsUrl;
  private _natsClient: Client;

  public constructor({
    createSubscriptions,
    natsUrl
  }: {
    createSubscriptions: (Client) => void;
    natsUrl: INatsUrl;
  }) {
    this._createSubscriptions = createSubscriptions;
    this._natsUrl = natsUrl;
    this._natsClient = this._connect();
  }

  private _connect(): Client {
    const url = `${this._natsUrl.host}:${this._natsUrl.port}`;
    console.log(`[NATS] Connecting to ${url}`);
    const nc = connect({ url: `nats://${url}` });

    nc.on('error', (err) => {
      console.error(`${NatsConnection._logPrefix} error occured`, err);
      this._reconnect();
    });
    nc.on('connect', () => {
      console.log(`${NatsConnection._logPrefix} client connected. Creating subscriptions.`);
      this._createSubscriptions(nc);
    });

    nc.on('disconnect', () => {
      console.log(`${NatsConnection._logPrefix} client disconnected`);
    });

    nc.on('reconnecting', () => {
      console.log(`${NatsConnection._logPrefix} client reconnecting`);
    });

    nc.on('reconnect', () => {
      console.log(`${NatsConnection._logPrefix} client reconnected`);
    });

    nc.on('close', () => {
      console.log(`${NatsConnection._logPrefix} client closed`);
      this._reconnect();
    });

    nc.on('permission_error', (err) => {
      console.error(`${NatsConnection._logPrefix} permission_error`, err);
    });
    return nc;
  }

  private _reconnect(): void {
    console.log(`${NatsConnection._logPrefix} draining and closing client`);
    this._natsClient.removeAllListeners();
    this._natsClient.drain();
    this._natsClient.close();

    // Set timeout to space out reconnection attempts to as to not overwhelm NATS server
    setTimeout(() => {
      console.log(`${NatsConnection._logPrefix} reconnecting client`);
      this._natsClient = this._connect();
    }, 5 * 1000);
  }
}
