import { arrayify, Signature, splitSignature } from '@ethersproject/bytes';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Keys } from '@ew-did-registry/keys';
import { soliditySha3 } from 'web3-utils';
import abi from './ev-registry.abi';

export class EvRegistry {
  private readonly _contract: Contract;

  public constructor(operatorKeys: Keys, providerUrl: string, evRegistryAddress: string) {
    console.log('[EV REGISTRY] connecting to provider', providerUrl);
    const provider = new JsonRpcProvider(providerUrl);
    const signer = new Wallet(operatorKeys.privateKey, provider);
    console.log('[EV REGISTRY] connecting to contract', evRegistryAddress);
    this._contract = new Contract(evRegistryAddress, abi, signer);
  }

  /**
   * Check for existence of user
   */
  public async userExists(): Promise<boolean> {
    const user = await this._contract.signer.getAddress();
    const exists = await this._contract.getAllUserAddresses();
    return exists.includes(user);
  }

  /**
   * Check for existence of device
   */
  public async deviceExists(address: string): Promise<boolean> {
    const exists = await this._contract.getAllDeviceAddresses();
    return exists.includes(address);
  }

  /**
   *
   * @returns device address and user address associated with a OCPI uid
   */
  public async getRegisteredDevice(
    uid: string
  ): Promise<{ deviceAddress: string; userAddress: string } | undefined> {
    if (!uid) {
      return undefined;
    }
    const deviceAddresses = await this._contract.getDeviceFromIdentifier(uid);
    return { deviceAddress: deviceAddresses[0], userAddress: deviceAddresses[1] };
  }

  /**
   * Adds user (MSP/CPO, represented by wallet) to registry contract
   */
  public async addUser(): Promise<void> {
    if (await this.userExists()) {
      console.log('[EV REGISTRY] user already exists');
      return;
    }
    console.log('[EV REGISTRY] user does not exist');
    const user = await this._contract.signer.getAddress();
    const { r, s, v } = await this._getSignature(user);
    await this._contract.addUser(user, v, r, s);
  }

  /**
   * Adds asset (vehicle/charge point, represented by wallet) to registry contract
   */
  public async addDevice(address: string, uid: string): Promise<void> {
    if (await this.deviceExists(address)) {
      console.log('[EV REGISTRY] device already exists', address, uid);
      return;
    }
    console.log(`[${new Date()}]`, '[EV REGISTRY] device does not exist', address, uid);
    const user = await this._contract.signer.getAddress();
    // convert uid to buffer so vehicle ID isn't parsed as an integer
    const { r, v, s } = await this._getSignature(address, Buffer.from(uid), user);
    await this._contract.addDevice(address, uid, user, v, r, s);
  }

  /**
   * EV Registry contract allows for transaction relaying but requires the
   * operator to add devices (i.e. can't be signed by device)
   *
   * @param params arbitrary number of parameters that will be signed
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _getSignature(...params: any[]): Promise<Signature> {
    const hash = soliditySha3(...params);
    const hashBytes = arrayify(hash as string);
    const signature = await this._contract.signer.signMessage(hashBytes);
    return splitSignature(signature);
  }
}
