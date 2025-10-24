import fetch from 'cross-fetch';

const RELAYER_BASE = process.env.REACT_APP_RELAYER_URL || 'https://relayer.example';

export async function registerInput({ contract, inputBytes, meta = {} }) {
  const res = await fetch(RELAYER_BASE + '/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contract, input: Array.from(inputBytes), meta })
  });
  if (!res.ok) throw new Error('register failed');
  return res.json();
}

export async function requestComputation({ registrationId, operation, params = {} }) {
  const res = await fetch(RELAYER_BASE + '/compute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationId, operation, params })
  });
  if (!res.ok) throw new Error('compute request failed');
  return res.json();
}

export async function getResult(jobId) {
  const res = await fetch(RELAYER_BASE + `/result/${jobId}`);
  if (!res.ok) throw new Error('getResult failed');
  const payload = await res.json();
  return new Uint8Array(payload.result);
}
