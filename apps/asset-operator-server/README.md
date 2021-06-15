
# asset-operator-server

A node server which listens for NATS messages related to the EV charging prequalification process.

## Installation and setup
The `asset-operator-server` can be installed by running `npm i -g @energyweb/ev-asset-operator-server`

Several configuration values are required to run the app. Please request these values as necessary.
An example configuration file can be found in `config/example-config.json`

Once the app is installed, it can be run using  
```
ev-server "/path/to/config.json"
```

Upon start up, a message similar to this should be displayed:
```
[NATS] Connecting to <NATS url>
[NATS Connection] client connected. Creating subscriptions.
[NATS] Listening for asset claim requests and issued claims
```

## Prequalification process

### Prequalification request
When prequalification is initiated by the MSP or CPO using the EV Dashboard, a message is sent over NATS which is a trigger for the
asset-operator-server to request prequalification on behalf of an asset. This must be done server side (instead of in the EV Dashboard
client) because the asset's private key is held server side.

When a prequalification request message is received, a message similar to this one should be output:
```
[NATS] Received prequalification REQUEST for: {"did":"did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F"}
[NATS] Queried signer for asset: did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F
[NATS] Requesting prequalification for asset: did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F
[Asset] did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F is requestingPrequalification
[Asset] did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F, retrieving DIDs with role: <prequalification issuer role>
[Asset] did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F is creating claim request {
  issuer: [
    'did:ethr:0x77a0F749058A52A39A25DF9EE7e6D5a5377eC5ce',
    'did:ethr:0x08f1939a94e4155Fb9B81A068800dCbcDe33adA0'
  ],
  claim: '{"fields":[],"claimType":"<prequalification role>","claimTypeVersion":"1.0.0"}'
}
[Asset] did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F claim request created
```
In addition, several messages such are the ones below may be displayed:
```
[NATS] Received message on claims exchange.
[NATS] Received message does not contained an issued token
[NATS] Received message on claims exchange.
[NATS] Received message does not contained an issued token
[NATS] Received message on claims exchange.
```
This is because for each known issuer of the role, a notification is sent.

### Prequalification issuance
When the TSO approves the prequalification request and issues the prequalification claim on the EV dashboard,
a message is sent over NATS which contains the issued (signed) credential. This credential is received by the 
server which persists it on IPFS and adds a link to it in the asset's DID document service array.

```
[NATS] Received ISSUED CLAIM: {"id":"adff46b5-5e45-4ae5-9401-c6a538524e71","issuedToken":"<issued jwt>","requester":"did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F","claimIssuer":["<issuer DID>"],"acceptedBy":"<issuer DID>"}
[NATS] Retrieved signer for asset: did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F
[NATS] Publishing claim for asset: did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F
[Asset] did:ethr:0xDE7dF6a331c9244702bB99C22370e3447252629F published claim to DID Document
```
