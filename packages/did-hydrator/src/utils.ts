import { Methods } from '@ew-did-registry/did';

export function getDIDFromAddress(address: string): string {
  return `did:${Methods.Erc1056}:${address}`;
}
