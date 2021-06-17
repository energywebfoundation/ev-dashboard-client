
# asset-operator-cli

A javascript cli which allows reading and writing to EV Registry smart contract as well as
generating keypairs for devices.

The `asset-operator-cli` can be installed by running `npm i -g @energyweb/ev-asset-operator-cli`

#### Add a user

This command will register the OCN party corresponding to
the private key as a user in the ocn registry

```
ev-cli add-user \
 --operator-key <private key of OCN party> \
 --ev-registry-address <address of EV registry> \
 --provider-url <RPC url>
```

#### Generate device keypair

This command will generate a sqlite db file named `keymanager.db`
if it doesn't exist and will generate a keypair with an address and private key.

```
ev-cli generate-key
```

#### Add a device 

This command will register the device to the party corresponding to
the private key.
The device UID can be for example an OCPI token UID or an OCPI evse ID. 

```
ev-cli add-device \
 --operator-key <private key of OCN party> \
 --ev-registry-address <address of EV registry> \
 --provider-url <RPC url> \
 --device-address <the address from generate-key. Only address, not with did method> \
 --device-uid <the OCPI uid of the device>
```
Example:
```
ev-cli add-device \
 --operator-key 424b82cb3f4c74a975c209192c4b6867a0d9294a0dd41dd83b468fe0d0c634da \
 --ev-registry-address 0xacbcC4db79893CDA1714795Ce26686EEb7D85E5C \
 --provider-url https://volta-rpc.energyweb.org \
 --device-address 0x95caf3C2aBa58497ea2381Fdc1D7D09deC41C620 \
 --device-uid 123456 
```

#### Hydrate a device DID document

This command will transfer some tokens from the operator to the device account
and "create" the device's DID document (i.e. will add the device's public key to the document).

```
ev-cli create-document \
 --operator-key <private key of account with funds for device account> \
 --did-registry-address <address of DID registry> \
 --provider-url <RPC url> \
 --transfer-amount <The amount of Volta token or EWT to transfer to the asset> \
 --device-did <the DID of the device. The private key for this DID should be available in `keymanager.db`>
 ```
 Example:
```
ev-cli create-document \
 --operator-key 424b82cb3f4c74a975c209192c4b6867a0d9294a0dd41dd83b468fe0d0c634da \
 --did-registry-address 0xc15d5a57a8eb0e1dcbe5d88b8f9a82017e5cc4af \
 --provider-url https://volta-rpc.energyweb.org \
 --transfer-amount 0.001 \
 --device-did did:ethr:0x90052544A684935E3D5Ede4741505e332770E5D7
 ``` 

 #### Add claim to DID document

 This command will issue a credential signed by the `operator-key` and retrieves the key associated
 with the device DID from the `keymanager.db` to add the claim to the device's DID document.
 The credential will contain a claim regarding the `data-endpoint` parameter.

```
ev-cli add-claim \
 --operator-key <private key of account with funds for device account> \
 --did-registry-address <address of DID registry> \
 --provider-url <RPC url> \
 --data-endpoint <The endpoint to include in the claim> \
 --device-did <the DID of the device. The private key for this DID should be available in `keymanager.db`>
 ```
 Example:
```
ev-cli add-claim \
 --operator-key 424b82cb3f4c74a975c209192c4b6867a0d9294a0dd41dd83b468fe0d0c634da \
 --did-registry-address 0xc15d5a57a8eb0e1dcbe5d88b8f9a82017e5cc4af \
 --provider-url https://volta-rpc.energyweb.org \
 --data-endpoint http://device-manufacturer/#did:ethr:0x90052544A684935E3D5Ede4741505e332770E5D7 \
 --device-did did:ethr:0x90052544A684935E3D5Ede4741505e332770E5D7
 ``` 
