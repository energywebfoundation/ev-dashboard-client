# EV Dashboard Client v0.1

## Disclaimer
> The EW-DID library is not ready for production grade applications.

## Introduction
This repository provides apps and packages to allow assets/devices to register in the ev-dashboard
and obtain claims for participation in a flexibility market

## Architecture Diagram

![EV Dashboard Client Architecture](https://github.com/energywebfoundation/ev-dashboard-client/blob/master/architecture.png)

## Component Descriptions

### Apps

#### asset-operator-server

A node express HTTP server which bundles and operator the client libraries

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
