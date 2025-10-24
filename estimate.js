import { initTFHE, generateKeypair, encryptNumber, decryptNumber, cipherToBytes, cipherFromBytes } from './tfheAdapter';
import { registerInput, requestComputation, getResult } from './relayerClient';

let LOCAL_KEYPAIR = null;

async function ensureKeys() {
  if (!LOCAL_KEYPAIR) {
    await initTFHE();
    LOCAL_KEYPAIR = generateKeypair();
  }
  return LOCAL_KEYPAIR;
}

export async function estimateAmountOutEncrypted(amountPlain, tokenInAddr) {
  const kp = await ensureKeys();
  const cipher = encryptNumber(kp.publicKey, Number(amountPlain));
  const bytes = cipherToBytes(cipher);
  const registration = await registerInput({ contract: process.env.REACT_APP_AMM_ADDRESS, inputBytes: bytes, meta: { purpose: 'estimate_swap' } });
  const job = await requestComputation({ registrationId: registration.id, operation: 'estimate_swap', params: { tokenIn: tokenInAddr } });
  const resultBytes = await getResult(job.id);
  const resultCipher = cipherFromBytes(resultBytes);
  const amountOut = decryptNumber(kp.secretKey, resultCipher);
  return amountOut;
}
