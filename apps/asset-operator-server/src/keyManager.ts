import { KeyManager } from '@energyweb/ev-key-manager';
import { config } from './config';
export const keyManager: KeyManager = new KeyManager(config.keyManagerDbPath);
