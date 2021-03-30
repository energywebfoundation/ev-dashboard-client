import { Wallet } from 'ethers';
import {
  deployContracts,
  GANACHE_PORT,
  evDashboardRegistry,
  ocnRegistry
} from '@ev-dashboard-client/contract-deployer';
import { EvRegistry } from '@ev-dashboard-client/asset-registrar';
import { execSync } from 'child_process';
import { Keys } from '@ew-did-registry/keys';
import { toHex } from 'web3-utils';

const wallet = Wallet.createRandom();
const keys = new Keys({ privateKey: wallet.privateKey });

const rpcUrl = `http://localhost:${GANACHE_PORT}`;

const test = (command: string, args): string => {
  return execSync(`ts-node src/cli.ts ${command} ${args}`).toString();
};

describe('asset-operator-cli', () => {
  let readArgs: string;
  let writeArgs: string;

  beforeAll(async () => {
    await deployContracts(wallet.privateKey);
    readArgs = `--provider-url ${rpcUrl} --ev-registry-address ${evDashboardRegistry.address}`;
    writeArgs = `--operator-key ${wallet.privateKey} ${readArgs}`;
    await ocnRegistry.setNode('http://node.org');
    await ocnRegistry.setParty(toHex('DE'), toHex('CPO'), [0], wallet.address);
  });

  it('can add-user', async () => {
    const args = writeArgs;
    test('add-user', args);
    const evRegistry = new EvRegistry({
      operatorKeys: keys,
      providerUrl: rpcUrl,
      evRegistryAddress: evDashboardRegistry.address
    });
    expect(await evRegistry.userExists()).toBe(true);
    const userExistsArgs = `${readArgs} --user-address ${keys.getAddress()}`;
    const result = test('user-exists', userExistsArgs);
    expect(result.includes('user is registered')).toBe(true);
  });

  it('can add-device', async () => {
    const uid = '72583848';
    const deviceAddress = '0x1c540B7C970F37917650e744d3627A64ac7DCc48';
    const args = `${writeArgs} --device-address ${deviceAddress} --device-uid ${uid}`;
    test('add-device', args);
    const evRegistry = new EvRegistry({
      operatorKeys: keys,
      providerUrl: rpcUrl,
      evRegistryAddress: evDashboardRegistry.address
    });
    expect(await evRegistry.deviceExists(deviceAddress)).toBe(true);
  });

  it('can generate-key', async () => {
    const args = writeArgs;
    const result = test('generate-key', args);
    console.log(result);
  });
});
