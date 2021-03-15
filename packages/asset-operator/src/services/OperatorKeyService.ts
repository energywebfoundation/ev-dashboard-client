import { Keys } from "@ew-did-registry/keys";

export class OperatorKeyService {
  public static getOperatorKeys(): Keys {
    return new Keys({ privateKey: process.env.OCN_IDENTITY })
  }
}