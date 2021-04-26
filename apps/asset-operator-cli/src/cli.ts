#!/usr/bin/env node

import { DID } from '@energyweb/ev-did-hydrator';
import { EvRegistry } from '@energyweb/ev-registry';
import { KeyManager } from '@energyweb/ev-key-manager';
import { Keys } from '@ew-did-registry/keys';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import * as yargs from 'yargs';

enum Args {
  operatorKey = 'operator-key',
  providerUrl = 'provider-url',
  transferAmount = 'transfer-amount',
  deviceDID = 'device-did',
  didRegistryAddress = 'did-registry-address',
  dataEndpoint = 'data-endpoint'
}

yargs
  .option(Args.operatorKey, {
    alias: 'k',
    string: true,
    describe: 'asset operator private key'
  })
  .option('ev-registry-address', {
    alias: 'e',
    string: true,
    describe: 'evRegistry Smart Contract address'
  })
  .option('did-registry-address', {
    alias: 'i',
    string: true,
    describe: 'DID Registry Smart Contract address'
  })
  .option('provider-url', {
    alias: 'p',
    string: true,
    describe: 'RPC Url'
  })
  .option('device-address', {
    alias: 'a',
    string: true,
    describe: 'account address of device to register'
  })
  .option('device-did', {
    alias: 'v',
    string: true,
    describe: 'DID of device'
  })
  .option('device-uid', {
    alias: 'u',
    string: true,
    describe: 'uid of device to register'
  })
  .option(Args.transferAmount, {
    alias: 'm',
    string: true,
    describe: 'the token amount to transfer'
  })
  .option(Args.dataEndpoint, {
    alias: 'd',
    string: true,
    describe: 'data endpoint for device'
  })
  .command(
    'add-user',
    'add user to EV Registry smart contract',
    () => {},
    async (args) => {
      checkEvRegistryArgs(args);

      const keys: Keys = new Keys({ privateKey: args['operator-key'] as string });
      const evRegistry = new EvRegistry(
        keys,
        args['provider-url'] as string,
        args['ev-registry-address'] as string
      );
      await evRegistry.addUser();
    }
  )
  .command(
    'add-device',
    'add device to EV Registry smart contract',
    () => {},
    async (args) => {
      checkEvRegistryArgs(args);
      if (!args['device-address'] || !args['device-uid']) {
        console.log('Need both device address and device uid to add-device');
        process.exit(1);
      }
      const keys: Keys = new Keys({ privateKey: args['operator-key'] as string });
      const evRegistry = new EvRegistry(
        keys,
        args['provider-url'] as string,
        args['ev-registry-address'] as string
      );
      await evRegistry.addDevice(args['device-address'] as string, args['device-uid']);
    }
  )
  .command(
    'generate-key',
    'generate keypair for a device',
    () => {},
    async () => {
      const keyManager = new KeyManager('keymanager.db');
      const newAddress = keyManager.generateKeyPair();
      console.log(newAddress);
    }
  )
  .command(
    'create-document',
    'generate DID document for a device',
    () => {},
    async (args) => {
      const deviceDID = checkForArg(Args.deviceDID, args);
      const transferAmount = checkForArg(Args.transferAmount, args);
      const did = createDID(args);
      console.log('creating DID document');
      await did.createDocument(deviceDID, parseFloat(transferAmount));
      console.log(`created DID document`);
    }
  )
  .command(
    'add-claim',
    'issue claim to device on behalf of operator',
    () => {},
    async (args) => {
      const deviceDID = checkForArg(Args.deviceDID, args);
      const dataEndpoint = checkForArg(Args.dataEndpoint, args);
      const did = createDID(args);
      console.log('creating claim');
      await did.addClaim(deviceDID, { endpoint: dataEndpoint });
      console.log(`created claim`);
    }
  )
  .help()
  .parse();

function checkEvRegistryArgs(args: object): void {
  checkForArg(Args.operatorKey, args);
  checkForArg('ev-registry-address', args);
  checkForArg('provider-url', args);
}

function createDID(args: object): DID {
  const didRegistryAddress = checkForArg(Args.didRegistryAddress, args);
  const operatorKey = checkForArg(Args.operatorKey, args);
  const providerUrl = checkForArg(Args.providerUrl, args);
  const keys: Keys = new Keys({ privateKey: operatorKey as string });
  const keyManager = new KeyManager('keymanager.db');
  const ipfsUrl = 'https://ipfs.infura.io:5001/api/v0/';
  const ipfsStore = new DidStore(ipfsUrl);
  return new DID({
    signerProvider: keyManager,
    operatorKeys: keys,
    providerUrl,
    didRegistryAddress,
    didStore: ipfsStore
  });
}

function checkForArg(property: string, args: object): string {
  if (!args[property]) {
    console.log(`${property} needs to be provided`);
    process.exit(1);
  }
  return args[property] as string;
}
