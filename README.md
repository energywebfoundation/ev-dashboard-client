# EV Dashboard Client v0.1

## Disclaimer
> The EV Dashboard Client is not ready for production grade applications.

## Introduction
This repository provides apps and packages to allow users and assets/devices to register in the ev-dashboard registry
and obtain claims for participation in a flexibility market

## Usage

The two apps which are available are the [asset-operator-server](#asset-operator-server)
and the [asset-operator-cli](#asset-operator-cli)
Currently, the libraries are not published to npm and so the repository must be built as per the [Development instructions](#development) in order to use the apps.

### Running asset-operator-cli

First, build the project as per [Development instructions](#development). Then, commands can be executed againts the compiled files.

#### Add a user

This command will register the OCN party corresponding to
the private key as a user in the ocn registry

```
cd apps/asset-operator-cli
pnpx node dist/src/cli.js add-user \
 --operator-key <private key of OCN party>
 --ev-registry-address <address of EV reg>
 --provider-url <RPC url>
```

#### Generate device keypair

This command will generate a sqlite db file named `keymanager.db`
if it doesn't exist and will generate a keypair with an address and private key.

```
cd apps/asset-operator-cli
pnpx node dist/src/cli.js generate-key
```

#### Add a device 

This command will register the device to the party corresponding to
the private key.
The device UID can be for example an OCPI token UID or an OCPI evse ID. 

```
cd apps/asset-operator-cli
pnpx node dist/src/cli.js add-device \
 --operator-key <private key of OCN party>
 --ev-registry-address <address of EV reg>
 --provider-url <RPC url> \
 --device-address <the address from generate-key. Only address, not with did method> \
 --device-uid <the OCPI uid of the device>
```
Example:
```
pnpx node dist/src/cli.js add-device \
 --operator-key 424b82cb3f4c74a975c209192c4b6867a0d9294a0dd41dd83b468fe0d0c634da
 --ev-registry-address 0xacbcC4db79893CDA1714795Ce26686EEb7D85E5C
 --provider-url https://volta-rpc.energyweb.org \
 --device-address 0x95caf3C2aBa58497ea2381Fdc1D7D09deC41C620 \
 --device-uid 123456 
```

### Running asset-operator-server
Several configuration values are required to run the app. Please request these values as necessary.

Once the app is built and the configuration has been provided, the app can be run by executing:
```
cd apps/asset-operator-server
pnpm start
```

## Architecture Diagram

![EV Dashboard Client Architecture](https://github.com/energywebfoundation/ev-dashboard-client/blob/master/architecture.png)

## Component Descriptions

### Apps

#### asset-operator-server

A node express HTTP server which bundles and operator the client libraries.

### Libraries

#### did-hydrator

Fund an asset's EWC account and create its DID Document to prepare it to request a prequalification claim

#### asset-registrar

Registers an asset or user in the `ev-registry` smart contract

#### prequalification-client

Listens for NATS events regarding prequalification claims and handles them on behalf of asset(s).

#### signer-provider-interface

An interface which provides access to a Signer for a given DID

### Databases

#### key-manager

Optional component that can be used to centrally manage keys.
Implements `signer-provider-interface`.
Can generate a new address/key-pair and well as provide existing key-pairs.

## Development

This repository is a monorepo that uses [Rush](https://rushjs.io/) with the PNPM package manager.

PNPM is used for its speed and solution to NPM doppelgangers (as well as being the default option for rush). See comparison of [NPM vs PNPM vs Yarn for Rush](https://rushjs.io/pages/maintainer/package_managers/).

### Install PNPM and Rush

PNPM is required. See installation instructions here: https://pnpm.js.org/installation/

Rush is required. See installation instructions here: https://rushjs.io/pages/intro/get_started/

### Installing Dependencies

Use rush to install dependencies (not the package manager directly).
In other words, do not run `npm install` or `pnpm install`.
This is because [Rush optimizes](https://rushjs.io/pages/developer/new_developer/) by installing all of the dependency packages in a central folder, and then uses symlinks to create the “node_modules” folder for each of the projects.

```sh
$ rush install
```

### Compile & Build

Use rush to build.

```sh
$ rush build
```

### Linting and Formating

This repository use ESLint for code conventions and Prettier for syntax formatting.
Both are setup according to [Rush recommendations](https://rushjs.io/pages/maintainer/enabling_prettier/):
- ESLint is configured per project while Prettier is configured globally.
- Prettier is configured to run as a pre-commit hook.
