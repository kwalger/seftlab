/**
 * Web Crypto HMAC-SHA256 Signed Session Token & Edge Request Security Helpers
 * 100% Native Edge Runtime & Node.js compatible (Handles full UTF-8/Arabic without btoa range errors).
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const FIREBASE_JWKS_URL = new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
);

let ephemeralDevSecret: string | null = null;
let firebaseJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

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

const MIN_SESSION_SECRET_LENGTH = 32;

function getSessionSecret(): string {
  const configured = (
    process.env.SESSION_SECRET ||
    process.env.AUTH_SESSION_SECRET ||
    ''
  ).trim();

  if (process.env.NODE_ENV === 'production') {
    if (configured.length < MIN_SESSION_SECRET_LENGTH) {
      throw new Error(
        '[Session] SESSION_SECRET / AUTH_SESSION_SECRET (min 32 chars) is required in production.'
      );
    }
    return configured;
  }

  if (configured.length > 0) {
    return configured;
  }

  if (!ephemeralDevSecret) {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    ephemeralDevSecret = base64UrlEncode(randomBytes);
  }
  return ephemeralDevSecret;
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
  payload: Record<string, unknown>,
  maxAgeSeconds = DEFAULT_SESSION_TTL_SECONDS
): Promise<string> {
  const now = Date.now();
  const signedPayload = {
    ...payload,
    issuedAt: typeof payload.issuedAt === 'number' ? payload.issuedAt : now,
    exp: now + maxAgeSeconds * 1000,
  };

  const enc = new TextEncoder();
  const payloadJson = JSON.stringify(signedPayload);
  const payloadBytes = enc.encode(payloadJson);
  const payloadB64 = base64UrlEncode(payloadBytes);

  const key = await getHmacKey(getSessionSecret());
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
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signatureB64] = parts;
    if (!payloadB64 || !signatureB64) return null;

    const enc = new TextEncoder();
    const key = await getHmacKey(getSessionSecret());
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
    const parsed = JSON.parse(dec.decode(payloadBytes)) as Record<
      string,
      unknown
    >;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }

    const now = Date.now();
    if (typeof parsed.exp === 'number') {
      if (now > parsed.exp) return null;
    } else if (typeof parsed.issuedAt === 'number') {
      if (now - parsed.issuedAt > DEFAULT_SESSION_TTL_SECONDS * 1000) {
        return null;
      }
    } else {
      return null;
    }

    return parsed as T;
  } catch {
    return null;
  }
}

function isAllowedRequestOrigin(
  request: Request,
  candidateOrigin: string
): boolean {
  try {
    const parsedCandidate = new URL(candidateOrigin);
    if (
      parsedCandidate.protocol !== 'http:' &&
      parsedCandidate.protocol !== 'https:'
    ) {
      return false;
    }

    const reqUrl = new URL(request.url);
    if (parsedCandidate.origin === reqUrl.origin) {
      return true;
    }

    const forwardedHost = request.headers
      .get('x-forwarded-host')
      ?.split(',')[0]
      ?.trim();
    const hostHeader =
      forwardedHost || request.headers.get('host')?.split(',')[0]?.trim();
    if (!hostHeader) return false;

    const forwardedProto = request.headers
      .get('x-forwarded-proto')
      ?.split(',')[0]
      ?.trim();
    const expectedProto = forwardedProto || reqUrl.protocol.replace(':', '');

    return (
      parsedCandidate.host === hostHeader &&
      (parsedCandidate.protocol === `${expectedProto}:` ||
        parsedCandidate.protocol === 'https:')
    );
  } catch {
    return false;
  }
}

export function verifySameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (origin) {
    return isAllowedRequestOrigin(request, origin);
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return isAllowedRequestOrigin(request, new URL(referer).origin);
    } catch {
      return false;
    }
  }

  return true;
}

function getFirebaseJwks() {
  if (!firebaseJwks) {
    firebaseJwks = createRemoteJWKSet(FIREBASE_JWKS_URL);
  }
  return firebaseJwks;
}

export async function verifyFirebaseIdToken(
  idToken: string
): Promise<{ uid: string; email: string; name?: string } | null> {
  if (!idToken || typeof idToken !== 'string') return null;
  try {
    const projectId = (
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      ''
    ).trim();
    if (!projectId) return null;

    const { payload } = await jwtVerify(idToken, getFirebaseJwks(), {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    const uid = typeof payload.sub === 'string' ? payload.sub : '';
    const email =
      typeof payload.email === 'string'
        ? payload.email.trim().toLowerCase()
        : '';
    const name =
      typeof payload.name === 'string' ? payload.name.trim() : undefined;
    if (!uid || !email) return null;
    return { uid, email, name };
  } catch {
    return null;
  }
}
