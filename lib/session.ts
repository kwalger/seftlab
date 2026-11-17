/**
 * Web Crypto HMAC-SHA256 Signed Session Token
 * 100% Native Edge Runtime & Node.js compatible (Zero dependencies, zero build warnings)
 * Handles full UTF-8 (Arabic) without btoa range errors, and cryptographically signs sessions.
 */

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'seftlab-session-secret-key-change-in-production-env';

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSignedSessionToken(
  payload: Record<string, unknown>
): Promise<string> {
  const enc = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadBytes = enc.encode(payloadJson);
  const payloadB64 = base64UrlEncode(payloadBytes);

  const key = await getHmacKey(SESSION_SECRET);
  const signatureBytes = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64))
  );
  const signatureB64 = base64UrlEncode(signatureBytes);

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySignedSessionToken<T = Record<string, unknown>>(
  token: string
): Promise<T | null> {
  try {
    const [payloadB64, signatureB64] = token.split('.');
    if (!payloadB64 || !signatureB64) return null;

    const enc = new TextEncoder();
    const key = await getHmacKey(SESSION_SECRET);
    const signatureBytes = base64UrlDecode(signatureB64);

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      enc.encode(payloadB64)
    );
    if (!valid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(payloadBytes)) as T;
  } catch {
    return null;
  }
}
