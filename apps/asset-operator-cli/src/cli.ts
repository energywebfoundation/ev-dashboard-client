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
  .help()
  .parse();

function checkEvRegistryArgs(args: any): void {
  if (!args['operator-key']) {
    console.log('operator-key needs to be provided');
    process.exit(1);
  }
  if (!args['ev-registry-address']) {
    console.log('ev-registry-address needs to be provided');
    process.exit(1);
  }
  if (!args['provider-url']) {
    console.log('provider-url needs to be provided');
    process.exit(1);
  }
}
