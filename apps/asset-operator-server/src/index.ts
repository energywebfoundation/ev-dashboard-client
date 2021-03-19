import express from 'express';
import bodyParser from 'body-parser';
import { EvRegistry } from '@ev-dashboard-client/asset-registrar';
import { DID } from '@ev-dashboard-client/did-hydrator';
import { KeyManager } from '@ev-dashboard-client/key-manager';
import { Keys } from '@ew-did-registry/keys';
import { config } from './config';

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
const port = 8080; // default port to listen

const keys = new Keys({ privateKey: config.assetOperator.operatorKey });

/** REGISTRATION */
const evRegistry = new EvRegistry(
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
const keyManager = new KeyManager('keymanager.db');
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
