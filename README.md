# EV-Dashboard Client Packages

This repository provides packages to allow assets/devices to register in the ev-dashboard
and obtain claims for participate in a flexibility market

## Architecture Diagram

![EV Dashboard Client Architecture](https://github.com/energywebfoundation/ev-dashboard-client/blob/master/architecture.png)

## Package description

### asset-operator

Provides an API for AssetOperators to enable their assets to participate in the ev-dashboard.
Two broad tasks are supported:

- document-creation: Fund an asset's EWC account and create its DID Document to prepare it to request a prequalification claim
- registration: Register an asset in the `ev-registry` smart contract

### prequalification-client

A node app which has the ability to listen to prequalification claim events on behalf of asset(s).

### signer-provider-interface

An interface which provides access to a Signer for a given DID

### key-manager

Optional component that can be used to centrally manage keys.
Can generate a new address/key-pair and well as provide existing key-pairs.

### key-manager-client

A typescript class which provides access to key-manager API. Implements signer-provider-interface

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