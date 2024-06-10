const encoder = new TextEncoder();

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function signString(guid, password) {
  if (typeof guid !== 'string' || typeof password !== 'string') {
    throw new TypeError('Both GUID and password should be strings');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(guid));

  return bufferToHex(signature);
}

export async function isStringSignatureValid(guid, password, signature) {
  if (typeof guid !== 'string' || typeof password !== 'string' || typeof signature !== 'string') {
    throw new TypeError('GUID, password, and signature should all be strings');
  }

  const expectedSignature = await signString(guid, password);
  return expectedSignature === signature;
}
