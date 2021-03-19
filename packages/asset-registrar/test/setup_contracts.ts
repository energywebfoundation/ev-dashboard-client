import { Wallet, providers, utils } from 'ethers';
import { EvDashboardRegistry } from '../ethers-types/EvDashboardRegistry';
import { Registry } from '../ethers-types/Registry';
import { EvDashboardRegistry__factory } from '../ethers-types/factories/EvDashboardRegistry__factory';
import { Registry__factory } from '../ethers-types/factories/Registry__factory';

const { JsonRpcProvider } = providers;
const { parseEther } = utils;

export const GANACHE_PORT = 8544;
export const provider = new JsonRpcProvider(`http://localhost:${GANACHE_PORT}`);
export let evDashboardRegistry: EvDashboardRegistry;
export let ocnRegistry: Registry;

export const replenish = async (acc: string): Promise<void> => {
  const faucet = provider.getSigner(2);
  await faucet.sendTransaction({
    to: acc,
    value: parseEther('1.0')
  });
};

export const deployContracts = async (privateKey: string): Promise<void> => {
  const wallet = new Wallet(privateKey, provider);
  await replenish(wallet.address);
  ocnRegistry = await new Registry__factory(wallet).deploy();
  evDashboardRegistry = await new EvDashboardRegistry__factory(wallet).deploy(ocnRegistry.address);
};
