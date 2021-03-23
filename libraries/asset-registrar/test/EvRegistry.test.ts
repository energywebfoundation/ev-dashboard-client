import { Wallet } from 'ethers';
import { deployContracts, GANACHE_PORT, evDashboardRegistry, ocnRegistry } from './setup_contracts';
import { EvRegistry } from '../src/ev-registry';
import { Keys } from '@ew-did-registry/keys';
import { toHex } from 'web3-utils';

const wallet = Wallet.createRandom();
const keys = new Keys({ privateKey: wallet.privateKey });

export const rpcUrl = `http://localhost:${GANACHE_PORT}`;

describe('EvRegistry tests', () => {
  beforeAll(async () => {
    await deployContracts(wallet.privateKey);
  });

  test('can register device', async () => {
    await ocnRegistry.setNode('http://node.org');
    await ocnRegistry.setParty(toHex('DE'), toHex('CPO'), [0], wallet.address);
    const evRegistry = new EvRegistry(keys, rpcUrl, evDashboardRegistry.address);
    await evRegistry.addUser();
    const uid = '72583848';
    const deviceAddress = '0x1c540B7C970F37917650e744d3627A64ac7DCc48';
    await evRegistry.addDevice(deviceAddress, uid);
    const deviceInfo = await evRegistry.getRegisteredDevice(uid);
    expect(deviceInfo?.deviceAddress).toEqual(deviceAddress);
    expect(deviceInfo?.userAddress).toEqual(wallet.address);
  });
});
