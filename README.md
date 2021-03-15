# EV-Dashboard Client Packages

This repository provides packages to allow assets/devices to register in the ev-dashboard
and obtain claims for participate in a flexibility market

## Architecture Diagram

![EV Dashboard Client Architecture](https://github.com/energywebfoundation/ocn-tools/blob/refactor-to-client/ev-registry-client-architecture.png)

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
