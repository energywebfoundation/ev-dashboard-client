import { Wallet } from 'ethers';
import {
  deployContracts,
  GANACHE_PORT,
  evDashboardRegistry,
  ocnRegistry
} from '@ev-dashboard-client/contract-deployer';
import { EvRegistry } from '../src/ev-registry';
import { Keys } from '@ew-did-registry/keys';
import { toHex } from 'web3-utils';
import { ERROR_MESSAGES } from '../src/errors';

const wallet = Wallet.createRandom();
const keys = new Keys({ privateKey: wallet.privateKey });

const rpcUrl = `http://localhost:${GANACHE_PORT}`;
const uid = '72583848';
const deviceAddress = '0x1c540B7C970F37917650e744d3627A64ac7DCc48';

describe('EvRegistry tests', () => {
  beforeAll(async () => {
    await deployContracts(wallet.privateKey);
  });

  test('can register device', async () => {
    await ocnRegistry.setNode('http://node.org');
    await ocnRegistry.setParty(toHex('DE'), toHex('CPO'), [0], wallet.address);
    const evRegistry = new EvRegistry({
      operatorKeys: keys,
      providerUrl: rpcUrl,
      evRegistryAddress: evDashboardRegistry.address
    });
    await evRegistry.addUser();
    await evRegistry.addDevice(deviceAddress, uid);
    const deviceInfo = await evRegistry.getRegisteredDevice(uid);
    expect(deviceInfo?.deviceAddress).toEqual(deviceAddress);
    expect(deviceInfo?.userAddress).toEqual(wallet.address);
  });

  test('cannot register user if no keys provided', async () => {
    const evRegistry = new EvRegistry({
      providerUrl: rpcUrl,
      evRegistryAddress: evDashboardRegistry.address
    });
    await expect(evRegistry.addUser()).rejects.toThrow(ERROR_MESSAGES.SIGNER_NOT_INITIALIZED);
  });

  test('cannot add device if no keys provided', async () => {
    const evRegistry = new EvRegistry({
      providerUrl: rpcUrl,
      evRegistryAddress: evDashboardRegistry.address
    });
    await expect(evRegistry.addDevice(deviceAddress, uid)).rejects.toThrow(
      ERROR_MESSAGES.SIGNER_NOT_INITIALIZED
    );
  });
});
