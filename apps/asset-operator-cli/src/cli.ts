#!/usr/bin/env node

import { EvRegistry } from '@ev-dashboard-client/asset-registrar';
import { KeyManager } from '@ev-dashboard-client/key-manager';
import { Keys } from '@ew-did-registry/keys';
import * as yargs from 'yargs';

yargs
  .option('operator-key', {
    alias: 'k',
    string: true,
    describe: 'asset operator private key'
  })
  .option('ev-registry-address', {
    alias: 'e',
    string: true,
    describe: 'evRegistry Smart Contract address'
  })
  .option('provider-url', {
    alias: 'p',
    string: true,
    describe: 'RPC Url'
  })
  .option('user-address', {
    alias: 'u',
    string: true,
    describe: 'account address of user to verify'
  })
  .option('device-address', {
    alias: 'd',
    string: true,
    describe: 'account address of device to register'
  })
  .option('device-uid', {
    alias: 'u',
    string: true,
    describe: 'uid of device to register'
  })
  .command(
    'add-user',
    'add user to EV Registry smart contract',
    () => {},
    async (args) => {
      checkEvRegistryWriteArgs(args);

      const keys: Keys = new Keys({ privateKey: args['operator-key'] as string });
      const evRegistry = new EvRegistry({
        operatorKeys: keys,
        providerUrl: args['provider-url'] as string,
        evRegistryAddress: args['ev-registry-address'] as string
      });
      await evRegistry.addUser();
    }
  )
  .command(
    'user-exists',
    'check for user in the EV Registry smart contract',
    () => {},
    async (args) => {
      checkEvRegistryReadArgs(args);
      const userAddress = args['user-address'];
      const keys = args['operator-key'] ? new Keys({ privateKey: args['operator-key'] }) : undefined;
      if (!keys && !userAddress) {
        console.log('Need operator-key or user-address to check for user');
        process.exit(1);
      }
      const evRegistry = new EvRegistry({
        operatorKeys: keys,
        providerUrl: args['provider-url'] as string,
        evRegistryAddress: args['ev-registry-address'] as string
      });
      const exists = await evRegistry.userExists(userAddress);
      console.log(exists ? 'user is registered' : 'user is not registered');
    }
  )
  .command(
    'list-users',
    'list alls user in the EV Registry smart contract',
    () => {},
    async (args) => {
      checkEvRegistryReadArgs(args);
      const evRegistry = new EvRegistry({
        providerUrl: args['provider-url'] as string,
        evRegistryAddress: args['ev-registry-address'] as string
      });
      const users = await evRegistry.listUsers();
      console.log(users);
    }
  )
  .command(
    'add-device',
    'add device to EV Registry smart contract',
    () => {},
    async (args) => {
      checkEvRegistryWriteArgs(args);
      if (!args['device-address'] || !args['device-uid']) {
        console.log('Need both device address and device uid to add-device');
        process.exit(1);
      }
      const keys: Keys = new Keys({ privateKey: args['operator-key'] as string });
      const evRegistry = new EvRegistry({
        operatorKeys: keys,
        providerUrl: args['provider-url'] as string,
        evRegistryAddress: args['ev-registry-address'] as string
      });
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
  .help()
  .parse();

function checkEvRegistryWriteArgs(args: any): void {
  if (!args['operator-key']) {
    console.log('operator-key needs to be provided');
    process.exit(1);
  }
  checkEvRegistryReadArgs(args);
}

function checkEvRegistryReadArgs(args: any): void {
  if (!args['ev-registry-address']) {
    console.log('ev-registry-address needs to be provided');
    process.exit(1);
  }
  if (!args['provider-url']) {
    console.log('provider-url needs to be provided');
    process.exit(1);
  }
}
