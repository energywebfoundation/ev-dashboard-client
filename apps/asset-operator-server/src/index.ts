import express from "express"
import bodyParser from "body-parser"
import { AssetOperator } from "@ev-dashboard-client/asset-operator"
import { KeyManagerClient } from "@ev-dashboard-client/key-manager-client"
import { Keys } from "@ew-did-registry/keys"
import { config } from "./config"

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
const port = 8080; // default port to listen

const keys = new Keys({ privateKey: config.assetOperator.operatorKey })
const assetOperator = new AssetOperator(keys)
const keyManagerClient = new KeyManagerClient()

app.post( "/asset-operator/create-did-document", async ( req, res ) => {
  await assetOperator.createDIDDocument(req.body.address, keyManagerClient, config.assetOperator.didDocument.providerUrl)
  res.send( "did document created" );
} );

app.post( "/asset-operator/register-user", async ( _req, res ) => {
  await assetOperator.registerUser(config.assetOperator.evRegistry.providerUrl, config.assetOperator.evRegistry.address)
  res.send( "user registered" );
} );

app.get( "/asset-operator/get-registered-asset", async ( req, res ) => {
  const isRegistered = await assetOperator.getRegisteredAsset(req.query.address as string, config.assetOperator.evRegistry.providerUrl, config.assetOperator.evRegistry.address)
  res.send( isRegistered );
} );

app.post( "/asset-operator/register-asset", async ( req, res ) => {
  await assetOperator.registerAsset(req.body.address, req.body.uid, config.assetOperator.evRegistry.providerUrl, config.assetOperator.evRegistry.address)
  res.send( "asset registered" );
} );

app.post( "/key-manager/generate", async ( _req, res ) => {
  const newDID = keyManagerClient.generateKeyPair();
  res.send( newDID );
} );

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );