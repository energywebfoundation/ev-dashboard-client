import { Wallet } from 'ethers';
import {
  deployContracts,
  GANACHE_PORT,
  evDashboardRegistry,
  ocnRegistry,
  didResolver
} from '@energyweb/ev-contract-deployer';
import { EvRegistry } from '@energyweb/ev-registry';
import { execSync } from 'child_process';
import { Keys } from '@ew-did-registry/keys';
import { toHex } from 'web3-utils';

const wallet = Wallet.createRandom();
const keys = new Keys({ privateKey: wallet.privateKey });
const deviceAddress = '0x1c540B7C970F37917650e744d3627A64ac7DCc48';

const rpcUrl = `http://localhost:${GANACHE_PORT}`;

const test = (command: string, args): string => {
  return execSync(`ts-node src/cli.ts ${command} ${args}`).toString();
};

describe('asset-operator-cli', () => {
  let baseArgs: string;

  beforeAll(async () => {
    await deployContracts(wallet.privateKey);
    baseArgs = `--provider-url ${rpcUrl} --operator-key ${wallet.privateKey} --ev-registry-address ${evDashboardRegistry.address}`;
    await ocnRegistry.setNode('http://node.org');
    await ocnRegistry.setParty(toHex('DE'), toHex('CPO'), [0], wallet.address);
  });

  it('can add-user', async () => {
    const args = baseArgs;
    test('add-user', args);
    const evRegistry = new EvRegistry(keys, rpcUrl, evDashboardRegistry.address);
    expect(await evRegistry.userExists()).toBe(true);
  });

  it('can add-device', async () => {
    const uid = '72583848';
    const args = `${baseArgs} --device-address ${deviceAddress} --device-uid ${uid}`;
    test('add-device', args);
    const evRegistry = new EvRegistry(keys, rpcUrl, evDashboardRegistry.address);
    expect(await evRegistry.deviceExists(deviceAddress)).toBe(true);
  });

  it('can generate-key', async () => {
    const args = baseArgs;
    test('generate-key', args);
  });

  it('can create-document and add-claim', async () => {
    // Create document
    const newDID = test('generate-key', baseArgs).trim();
    const createDocArgs = `${baseArgs} --device-did ${newDID} --did-registry-address ${didResolver.settings.address} --transfer-amount 0.005`;
    test('create-document', createDocArgs);
    const createdDoc = await didResolver.read(newDID);
    expect(createdDoc.publicKey.length).toEqual(1);

    // Add claim
    const endpoint = 'http://operator.org#device-data';
    const addClaimArgs = `${baseArgs} --device-did ${newDID} --did-registry-address ${didResolver.settings.address} --data-endpoint ${endpoint}`;
    test('add-claim', addClaimArgs);
    const docWithClaim = await didResolver.read(newDID);
    expect(docWithClaim.service.length).toEqual(1);
    console.log(JSON.stringify(docWithClaim));
  });
});
