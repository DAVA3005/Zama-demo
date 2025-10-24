// Minimal TFHE adapter for browser usage (uses hypothetical @zama/tfhe-sdk API)
import { TFHE } from '@zama/tfhe-sdk';

export async function initTFHE() {
  if (!TFHE.isReady) await TFHE.ready();
}

export function generateKeypair() {
  return TFHE.generateKeypair();
}

export function encryptNumber(publicKey, num, options = { precision: 6 }) {
  const fixed = TFHE.encodeFixedPoint(num, options.precision);
  return TFHE.encrypt(publicKey, fixed);
}

export function decryptNumber(secretKey, cipher, options = { precision: 6 }) {
  const fixed = TFHE.decrypt(secretKey, cipher);
  return TFHE.decodeFixedPoint(fixed, options.precision);
}

export function cipherToBytes(cipher) {
  return TFHE.serialize(cipher);
}

export function cipherFromBytes(bytes) {
  return TFHE.deserialize(bytes);
}
