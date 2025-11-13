// Type declarations for tweetnacl
declare module 'tweetnacl' {
  export interface Box {
    (msg: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, secretKey: Uint8Array): Uint8Array;
    open: (box: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, secretKey: Uint8Array) => Uint8Array | null;
    keyPair: () => { publicKey: Uint8Array; secretKey: Uint8Array };
  }

  export interface Sign {
    (msg: Uint8Array, secretKey: Uint8Array): Uint8Array;
    open: (signedMsg: Uint8Array, publicKey: Uint8Array) => Uint8Array | null;
    detached: (msg: Uint8Array, secretKey: Uint8Array) => Uint8Array;
    verify: (msg: Uint8Array, sig: Uint8Array, publicKey: Uint8Array) => boolean;
    keyPair: () => { publicKey: Uint8Array; secretKey: Uint8Array };
  }

  export const box: Box;
  export const sign: Sign;
  export const randomBytes: (length: number) => Uint8Array;

  const nacl: {
    box: Box;
    sign: Sign;
    randomBytes: (length: number) => Uint8Array;
  };

  export default nacl;
}

