import express from 'express';
import bodyParser from 'body-parser';
import { EvRegistry } from '@ev-dashboard-client/asset-registrar';
import { DID } from '@ev-dashboard-client/did-hydrator';
import { Keys } from '@ew-did-registry/keys';
import { config } from './config';
import { keyManager } from './keyManager';

export const initExpressServer = (): void => {
  // eslint-disable-next-line @rushstack/typedef-var
  const app = express();
  app.use(bodyParser.json()); // support json encoded bodies
  const port: number = 8080; // default port to listen

  const keys: Keys = new Keys({ privateKey: config.assetOperator.operatorKey });

  /** REGISTRATION */
  const evRegistry: EvRegistry = new EvRegistry(
    keys,
    config.assetOperator.evRegistry.providerUrl,
    config.assetOperator.evRegistry.address
  );

  app.post('/asset-operator/register-user', async (_req, res) => {
    await evRegistry.addUser();
    res.send('user registered');
  });

  app.get('/asset-operator/device-exists', async (req, res) => {
    const isRegistered = await evRegistry.deviceExists(req.query.address as string);
    res.send(isRegistered);
  });

  app.get('/asset-operator/device-is-registered', async (req, res) => {
    const isRegistered = await evRegistry.getRegisteredDevice(req.query.uid as string);
    res.send(isRegistered);
  });

  app.post('/asset-operator/register-device', async (req, res) => {
    await evRegistry.addDevice(req.body.address, req.body.uid);
    res.send('asset registered');
  });

  /** DID DOCUMENT */
  app.post('/asset-operator/create-did-document', async (req, res) => {
    const did = new DID(keyManager, keys, config.assetOperator.didDocument.providerUrl);
    await did.createDocument(req.body.address);
    res.send('did document created');
  });

  /** KEY MANAGER */
  app.post('/key-manager/generate', async (_req, res) => {
    const newDID = keyManager.generateKeyPair();
    res.send(newDID);
  });

  // start the Express server
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
};
