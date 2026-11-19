import { importPKCS8, SignJWT } from 'jose';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import {
  buildUserSyncPatch,
  extractSlugFromEmail,
  mapFirestoreDocToStudentTalent,
  normalizeStudentIdentifier,
} from '@/lib/student-profile';
import { StudentTalent, UserRole } from '@/types';

interface ServiceAccountCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

interface CachedAccessToken {
  accessToken: string;
  expiresAtMs: number;
  cacheKey: string;
}

interface FirestoreRestDocument {
  name?: string;
  fields?: Record<string, Record<string, unknown>>;
}

export interface FirebaseAuthAdminUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  disabled: boolean;
}

export interface SyncUserReportItem {
  uid: string;
  email: string;
  displayName: string;
  slug: string;
  profileUrl: string;
  role: UserRole;
  action: 'created' | 'updated' | 'unchanged' | 'error';
  updatedFields: string[];
  error?: string;
}

export interface SyncAllUsersResult {
  projectId: string;
  dryRun: boolean;
  summary: {
    totalAuthUsers: number;
    created: number;
    updated: number;
    unchanged: number;
    errors: number;
  };
  users: SyncUserReportItem[];
}

export interface SingleUserSyncResult {
  synced: boolean;
  isNew: boolean;
  updated: boolean;
  role: UserRole;
  slug: string;
  displayName: string;
  organizationOrUniversity: string;
  photoURL: string;
  error?: string;
}

type RestAuth =
  | { type: 'bearer'; token: string }
  | { type: 'apiKey'; key: string };

const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/identitytoolkit',
  'https://www.googleapis.com/auth/datastore',
].join(' ');

let cachedToken: CachedAccessToken | null = null;

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function decodeBase64ToUtf8(b64: string): string {
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/').trim();
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '='
  );
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function normalizePrivateKey(raw: string): string {
  return stripWrappingQuotes(raw).replace(/\\n/g, '\n').trim();
}

export function getFirebaseProjectId(): string {
  const creds = getServiceAccountCredentials();
  if (creds?.projectId) {
    return creds.projectId;
  }
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'seftlab'
  ).trim();
}

function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  const rawServiceAccount = (
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT ||
    ''
  ).trim();

  if (rawServiceAccount) {
    try {
      const unwrapped = stripWrappingQuotes(rawServiceAccount);
      const jsonString = unwrapped.startsWith('{')
        ? unwrapped
        : decodeBase64ToUtf8(unwrapped);
      const parsed = JSON.parse(jsonString) as Record<string, unknown>;
      const clientEmail =
        typeof parsed.client_email === 'string'
          ? parsed.client_email.trim()
          : '';
      const privateKey =
        typeof parsed.private_key === 'string'
          ? normalizePrivateKey(parsed.private_key)
          : '';
      const projectId =
        typeof parsed.project_id === 'string' && parsed.project_id.trim()
          ? parsed.project_id.trim()
          : (
              process.env.FIREBASE_PROJECT_ID ||
              process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
              'seftlab'
            ).trim();

      if (clientEmail && privateKey) {
        return { projectId, clientEmail, privateKey };
      }
    } catch {
      // Fall through to individual env vars
    }
  }

  const clientEmail = (
    process.env.FIREBASE_CLIENT_EMAIL ||
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    ''
  ).trim();
  const privateKeyRaw = (
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    ''
  ).trim();

  if (clientEmail && privateKeyRaw) {
    const projectId = (
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      'seftlab'
    ).trim();
    return {
      projectId,
      clientEmail,
      privateKey: normalizePrivateKey(privateKeyRaw),
    };
  }

  return null;
}

export function isFirebaseAdminConfigured(): boolean {
  return getServiceAccountCredentials() !== null;
}

async function getGoogleAdminAccessToken(): Promise<{
  accessToken: string;
  projectId: string;
}> {
  const creds = getServiceAccountCredentials();
  if (!creds) {
    throw new Error(
      'بيانات اعتماد Firebase Admin غير مُعدّة في متغيرات البيئة.'
    );
  }

  const cacheKey = `${creds.projectId}:${creds.clientEmail}`;
  const nowMs = Date.now();
  if (
    cachedToken &&
    cachedToken.cacheKey === cacheKey &&
    cachedToken.expiresAtMs - nowMs > 5 * 60 * 1000
  ) {
    return {
      accessToken: cachedToken.accessToken,
      projectId: creds.projectId,
    };
  }

  const privateKey = await importPKCS8(creds.privateKey, 'RS256');
  const nowSec = Math.floor(nowMs / 1000);

  const assertion = await new SignJWT({ scope: OAUTH_SCOPES })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(creds.clientEmail)
    .setSubject(creds.clientEmail)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(nowSec)
    .setExpirationTime(nowSec + 3600)
    .sign(privateKey);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text().catch(() => '');
    throw new Error(
      `فشل الحصول على رمز وصول Google OAuth2 (${tokenRes.status}): ${errText.slice(0, 200)}`
    );
  }

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!tokenData.access_token) {
    throw new Error('استجابة Google OAuth2 لم تتضمن access_token.');
  }

  const expiresInSec =
    typeof tokenData.expires_in === 'number' ? tokenData.expires_in : 3600;
  cachedToken = {
    accessToken: tokenData.access_token,
    expiresAtMs: nowMs + expiresInSec * 1000,
    cacheKey,
  };

  return {
    accessToken: tokenData.access_token,
    projectId: creds.projectId,
  };
}

function toFirestoreValue(val: unknown): Record<string, unknown> {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (typeof val === 'number') {
    if (!Number.isFinite(val)) return { integerValue: '0' };
    if (Number.isInteger(val)) {
      return { integerValue: String(val) };
    }
    return { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map((item) => toFirestoreValue(item)),
      },
    };
  }
  if (typeof val === 'object') {
    const fields: Record<string, Record<string, unknown>> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromFirestoreValue(val: Record<string, unknown>): unknown {
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    const arr = (val.arrayValue as { values?: Record<string, unknown>[] })
      ?.values;
    return Array.isArray(arr) ? arr.map((item) => fromFirestoreValue(item)) : [];
  }
  if ('mapValue' in val) {
    const fields = (
      val.mapValue as { fields?: Record<string, Record<string, unknown>> }
    )?.fields;
    if (!fields) return {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = fromFirestoreValue(v);
    }
    return out;
  }
  return null;
}

function decodeFirestoreDocument(docObj: FirestoreRestDocument): {
  id: string;
  data: Record<string, unknown>;
} {
  const fullName = docObj.name || '';
  const id = fullName.split('/').pop() || '';
  const data: Record<string, unknown> = {};
  if (docObj.fields) {
    for (const [k, v] of Object.entries(docObj.fields)) {
      data[k] = fromFirestoreValue(v);
    }
  }
  return { id, data };
}

function encodeFirestoreFields(
  patch: Record<string, unknown>
): Record<string, Record<string, unknown>> {
  const fields: Record<string, Record<string, unknown>> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) {
      fields[k] = toFirestoreValue(v);
    }
  }
  return fields;
}

function buildRestRequestOptions(
  url: string,
  auth: RestAuth,
  init?: RequestInit
): { url: string; init: RequestInit } {
  const headers = new Headers(init?.headers);
  let targetUrl = url;

  if (auth.type === 'bearer') {
    headers.set('Authorization', `Bearer ${auth.token}`);
  } else {
    const separator = url.includes('?') ? '&' : '?';
    targetUrl = `${url}${separator}key=${encodeURIComponent(auth.key)}`;
  }

  return {
    url: targetUrl,
    init: {
      ...init,
      headers,
    },
  };
}

function getFirestoreDocumentsBaseUrl(projectId: string): string {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/(default)/documents`;
}

async function getFirestoreDocRest(
  projectId: string,
  collectionName: string,
  docId: string,
  auth: RestAuth
): Promise<{ id: string; data: Record<string, unknown> } | null> {
  const rawUrl = `${getFirestoreDocumentsBaseUrl(projectId)}/${encodeURIComponent(
    collectionName
  )}/${encodeURIComponent(docId)}`;
  const req = buildRestRequestOptions(rawUrl, auth, { method: 'GET' });
  const res = await fetch(req.url, req.init);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      `Firestore GET ${collectionName}/${docId} failed (${res.status}): ${errText.slice(0, 200)}`
    );
  }
  const docObj = (await res.json()) as FirestoreRestDocument;
  return decodeFirestoreDocument(docObj);
}

async function listFirestoreCollectionRest(
  projectId: string,
  collectionName: string,
  bearerToken: string
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  const docs: Array<{ id: string; data: Record<string, unknown> }> = [];
  let pageToken = '';

  do {
    const params = new URLSearchParams({ pageSize: '300' });
    if (pageToken) {
      params.set('pageToken', pageToken);
    }
    const url = `${getFirestoreDocumentsBaseUrl(projectId)}/${encodeURIComponent(
      collectionName
    )}?${params.toString()}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    if (res.status === 404) {
      return docs;
    }
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(
        `Firestore LIST ${collectionName} failed (${res.status}): ${errText.slice(0, 200)}`
      );
    }

    const payload = (await res.json()) as {
      documents?: FirestoreRestDocument[];
      nextPageToken?: string;
    };

    if (Array.isArray(payload.documents)) {
      for (const docObj of payload.documents) {
        docs.push(decodeFirestoreDocument(docObj));
      }
    }

    pageToken = payload.nextPageToken || '';
  } while (pageToken);

  return docs;
}

async function patchFirestoreDocRest(
  projectId: string,
  collectionName: string,
  docId: string,
  patch: Record<string, unknown>,
  bearerToken: string
): Promise<void> {
  const fieldKeys = Object.keys(patch).filter((k) => patch[k] !== undefined);
  if (fieldKeys.length === 0) return;

  const params = new URLSearchParams();
  for (const key of fieldKeys) {
    params.append('updateMask.fieldPaths', key);
  }

  const url = `${getFirestoreDocumentsBaseUrl(projectId)}/${encodeURIComponent(
    collectionName
  )}/${encodeURIComponent(docId)}?${params.toString()}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: encodeFirestoreFields(patch),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      `Firestore PATCH ${collectionName}/${docId} failed (${res.status}): ${errText.slice(0, 200)}`
    );
  }
}

async function runFirestoreEqualityQueryRest(
  projectId: string,
  collectionName: string,
  fieldPath: string,
  value: string,
  auth: RestAuth
): Promise<{ id: string; data: Record<string, unknown> } | null> {
  const rawUrl = `${getFirestoreDocumentsBaseUrl(projectId)}:runQuery`;
  const req = buildRestRequestOptions(rawUrl, auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collectionName }],
        where: {
          fieldFilter: {
            field: { fieldPath },
            op: 'EQUAL',
            value: { stringValue: value },
          },
        },
        limit: 1,
      },
    }),
  });

  const res = await fetch(req.url, req.init);
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      `Firestore runQuery ${collectionName}.${fieldPath} failed (${res.status}): ${errText.slice(0, 200)}`
    );
  }

  const rows = (await res.json()) as Array<{ document?: FirestoreRestDocument }>;
  if (!Array.isArray(rows)) return null;

  for (const row of rows) {
    if (row.document) {
      return decodeFirestoreDocument(row.document);
    }
  }
  return null;
}

/**
 * Lists all Firebase Auth accounts using Google Identity Toolkit Admin REST API.
 */
export async function listAllFirebaseAuthUsers(): Promise<{
  projectId: string;
  accessToken: string;
  users: FirebaseAuthAdminUser[];
}> {
  const { accessToken, projectId } = await getGoogleAdminAccessToken();
  const users: FirebaseAuthAdminUser[] = [];
  let nextPageToken = '';

  do {
    const params = new URLSearchParams({ maxResults: '500' });
    if (nextPageToken) {
      params.set('nextPageToken', nextPageToken);
    }

    const url = `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(
      projectId
    )}/accounts:batchGet?${params.toString()}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(
        `فشل جلب المستخدمين من Firebase Auth (${res.status}): ${errText.slice(0, 240)}`
      );
    }

    const data = (await res.json()) as {
      users?: Array<{
        localId?: string;
        email?: string;
        displayName?: string;
        photoUrl?: string;
        photoURL?: string;
        createdAt?: string;
        disabled?: boolean;
        providerUserInfo?: Array<{
          email?: string;
          displayName?: string;
          photoUrl?: string;
        }>;
      }>;
      nextPageToken?: string;
    };

    if (Array.isArray(data.users)) {
      for (const raw of data.users) {
        const uid = typeof raw.localId === 'string' ? raw.localId.trim() : '';
        if (!uid) continue;

        const providerInfo = Array.isArray(raw.providerUserInfo)
          ? raw.providerUserInfo[0]
          : undefined;
        const email = (raw.email || providerInfo?.email || '')
          .trim()
          .toLowerCase();
        const displayName = (
          raw.displayName ||
          providerInfo?.displayName ||
          ''
        ).trim();
        const photoURL = (
          raw.photoUrl ||
          raw.photoURL ||
          providerInfo?.photoUrl ||
          ''
        ).trim();

        const createdMs = raw.createdAt ? Number(raw.createdAt) : NaN;
        const createdAt =
          Number.isFinite(createdMs) && createdMs > 0
            ? new Date(createdMs).toISOString()
            : new Date().toISOString();

        users.push({
          uid,
          email,
          displayName,
          photoURL,
          createdAt,
          disabled: Boolean(raw.disabled),
        });
      }
    }

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  return { projectId, accessToken, users };
}

/**
 * Ensures a single authenticated Firebase user has a complete, linked Firestore
 * profile document under `users/{uid}` without overwriting existing fields.
 */
export async function syncSingleUserToFirestoreServer(params: {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  requestedRole?: string;
  organizationOrUniversity?: string;
  idToken?: string;
}): Promise<SingleUserSyncResult> {
  const email = params.email.trim().toLowerCase();
  const isSuper = isSuperAdminEmail(email);
  const safeRequestedRole =
    params.requestedRole === 'admin' && !isSuper
      ? undefined
      : params.requestedRole;

  let projectId = getFirebaseProjectId();
  let bearerToken = params.idToken?.trim() || '';

  if (isFirebaseAdminConfigured()) {
    try {
      const adminAuth = await getGoogleAdminAccessToken();
      bearerToken = adminAuth.accessToken;
      projectId = adminAuth.projectId;
    } catch (err) {
      if (!bearerToken) {
        const fallback = buildUserSyncPatch({
          uid: params.uid,
          email,
          displayName: params.displayName,
          photoURL: params.photoURL,
          role: safeRequestedRole,
          organizationOrUniversity: params.organizationOrUniversity,
        }).resolved;
        return {
          synced: false,
          isNew: false,
          updated: false,
          role: fallback.role,
          slug: fallback.slug,
          displayName: fallback.displayName,
          organizationOrUniversity: fallback.organizationOrUniversity,
          photoURL: fallback.photoURL,
          error: err instanceof Error ? err.message : 'Admin token error',
        };
      }
    }
  }

  if (!bearerToken) {
    const fallback = buildUserSyncPatch({
      uid: params.uid,
      email,
      displayName: params.displayName,
      photoURL: params.photoURL,
      role: safeRequestedRole,
      organizationOrUniversity: params.organizationOrUniversity,
    }).resolved;
    return {
      synced: false,
      isNew: false,
      updated: false,
      role: fallback.role,
      slug: fallback.slug,
      displayName: fallback.displayName,
      organizationOrUniversity: fallback.organizationOrUniversity,
      photoURL: fallback.photoURL,
      error: 'No credentials available to sync Firestore document.',
    };
  }

  try {
    const auth: RestAuth = { type: 'bearer', token: bearerToken };
    const existingUidDoc = await getFirestoreDocRest(
      projectId,
      'users',
      params.uid,
      auth
    ).catch(() => null);

    let legacyDoc: { id: string; data: Record<string, unknown> } | null = null;
    if (!existingUidDoc && email) {
      legacyDoc = await runFirestoreEqualityQueryRest(
        projectId,
        'users',
        'email',
        email,
        auth
      ).catch(() => null);
    }

    const existingData = existingUidDoc?.data || legacyDoc?.data || null;
    const { patch, changed, isNew, resolved } = buildUserSyncPatch(
      {
        uid: params.uid,
        email,
        displayName: params.displayName,
        photoURL: params.photoURL,
        role: isSuper ? 'admin' : safeRequestedRole,
        organizationOrUniversity: params.organizationOrUniversity,
      },
      existingData,
      { forceCreate: !existingUidDoc }
    );

    let shouldWrite = isNew || changed;
    if (isSuper && (!existingUidDoc || existingUidDoc.data?.role !== 'admin')) {
      patch.role = 'admin';
      patch.updatedAt = new Date().toISOString();
      shouldWrite = true;
    }

    if (shouldWrite) {
      await patchFirestoreDocRest(
        projectId,
        'users',
        params.uid,
        patch,
        bearerToken
      );
    }

    return {
      synced: true,
      isNew,
      updated: !isNew && shouldWrite,
      role: isSuper ? 'admin' : resolved.role,
      slug: resolved.slug,
      displayName: resolved.displayName,
      organizationOrUniversity: resolved.organizationOrUniversity,
      photoURL: resolved.photoURL,
    };
  } catch (err) {
    const fallback = buildUserSyncPatch({
      uid: params.uid,
      email,
      displayName: params.displayName,
      photoURL: params.photoURL,
      role: isSuper ? 'admin' : safeRequestedRole,
      organizationOrUniversity: params.organizationOrUniversity,
    }).resolved;
    return {
      synced: false,
      isNew: false,
      updated: false,
      role: isSuper ? 'admin' : fallback.role,
      slug: fallback.slug,
      displayName: fallback.displayName,
      organizationOrUniversity: fallback.organizationOrUniversity,
      photoURL: fallback.photoURL,
      error: err instanceof Error ? err.message : 'Firestore REST sync failed',
    };
  }
}

/**
 * Synchronizes every Firebase Auth user into Firestore `users/{uid}`:
 * creates missing documents with `slug`/`username`/`uid`/`role: 'student'`,
 * and repairs missing link fields on existing documents non-destructively.
 */
export async function syncAllFirebaseAuthUsersToFirestore(options?: {
  dryRun?: boolean;
}): Promise<SyncAllUsersResult> {
  const dryRun = Boolean(options?.dryRun);
  const { projectId, accessToken, users: authUsers } =
    await listAllFirebaseAuthUsers();

  const existingUsers = await listFirestoreCollectionRest(
    projectId,
    'users',
    accessToken
  );

  const existingStudents = await listFirestoreCollectionRest(
    projectId,
    'students',
    accessToken
  ).catch(() => [] as Array<{ id: string; data: Record<string, unknown> }>);

  const usersByUid = new Map<
    string,
    { id: string; data: Record<string, unknown> }
  >();
  const usersByEmail = new Map<
    string,
    { id: string; data: Record<string, unknown> }
  >();
  const usedSlugs = new Map<string, string>();

  for (const docItem of existingUsers) {
    usersByUid.set(docItem.id, docItem);

    const docUid =
      typeof docItem.data.uid === 'string' && docItem.data.uid.trim()
        ? docItem.data.uid.trim()
        : docItem.id;
    const docEmail =
      typeof docItem.data.email === 'string'
        ? docItem.data.email.trim().toLowerCase()
        : '';
    if (docEmail && !usersByEmail.has(docEmail)) {
      usersByEmail.set(docEmail, docItem);
    }

    const existingSlug = (
      (typeof docItem.data.slug === 'string' ? docItem.data.slug : '') ||
      (typeof docItem.data.username === 'string' ? docItem.data.username : '')
    )
      .trim()
      .toLowerCase();
    if (existingSlug && !usedSlugs.has(existingSlug)) {
      usedSlugs.set(existingSlug, docUid);
    }
  }

  const studentsByUid = new Map<string, Record<string, unknown>>();
  const studentsByEmail = new Map<string, Record<string, unknown>>();
  for (const stuItem of existingStudents) {
    const stuUid =
      typeof stuItem.data.uid === 'string' && stuItem.data.uid.trim()
        ? stuItem.data.uid.trim()
        : stuItem.id;
    studentsByUid.set(stuUid, stuItem.data);

    const stuEmail =
      typeof stuItem.data.email === 'string'
        ? stuItem.data.email.trim().toLowerCase()
        : '';
    if (stuEmail && !studentsByEmail.has(stuEmail)) {
      studentsByEmail.set(stuEmail, stuItem.data);
    }
  }

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let errors = 0;
  const report: SyncUserReportItem[] = [];

  for (const authUser of authUsers) {
    const email = authUser.email.trim().toLowerCase();
    const existingAtUid = usersByUid.get(authUser.uid)?.data || null;
    const existingLegacy = !existingAtUid
      ? usersByEmail.get(email)?.data ||
        studentsByUid.get(authUser.uid) ||
        studentsByEmail.get(email) ||
        null
      : null;
    const baseExisting = existingAtUid || existingLegacy;

    const existingSlug = baseExisting
      ? (
          (typeof baseExisting.slug === 'string' ? baseExisting.slug : '') ||
          (typeof baseExisting.username === 'string'
            ? baseExisting.username
            : '')
        )
          .trim()
          .toLowerCase()
      : '';

    const candidateSlug =
      existingSlug || extractSlugFromEmail(email, authUser.uid);

    let finalSlug = candidateSlug;
    const owner = usedSlugs.get(finalSlug);
    if (owner && owner !== authUser.uid) {
      const uidShort =
        authUser.uid
          .slice(0, 6)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') || 'u';
      finalSlug = `${candidateSlug}-${uidShort}`;
      let suffixIndex = 2;
      while (
        usedSlugs.has(finalSlug) &&
        usedSlugs.get(finalSlug) !== authUser.uid
      ) {
        finalSlug = `${candidateSlug}-${uidShort}${suffixIndex}`;
        suffixIndex += 1;
      }
    }
    usedSlugs.set(finalSlug, authUser.uid);

    const { patch, changed, resolved } = buildUserSyncPatch(
      {
        uid: authUser.uid,
        email,
        displayName: authUser.displayName,
        photoURL: authUser.photoURL,
        role: 'student',
        createdAt: authUser.createdAt,
      },
      baseExisting,
      {
        slugOverride: finalSlug,
        forceCreate: !existingAtUid,
      }
    );

    const needsWrite = !existingAtUid || changed;
    const updatedFields = Object.keys(patch).filter((k) => k !== 'updatedAt');

    if (!needsWrite) {
      unchanged += 1;
      report.push({
        uid: authUser.uid,
        email: resolved.email,
        displayName: resolved.displayName,
        slug: resolved.slug,
        profileUrl: resolved.profileUrl,
        role: resolved.role,
        action: 'unchanged',
        updatedFields: [],
      });
      continue;
    }

    try {
      if (!dryRun) {
        await patchFirestoreDocRest(
          projectId,
          'users',
          authUser.uid,
          patch,
          accessToken
        );
      }

      if (!existingAtUid) {
        created += 1;
        report.push({
          uid: authUser.uid,
          email: resolved.email,
          displayName: resolved.displayName,
          slug: resolved.slug,
          profileUrl: resolved.profileUrl,
          role: resolved.role,
          action: 'created',
          updatedFields,
        });
      } else {
        updated += 1;
        report.push({
          uid: authUser.uid,
          email: resolved.email,
          displayName: resolved.displayName,
          slug: resolved.slug,
          profileUrl: resolved.profileUrl,
          role: resolved.role,
          action: 'updated',
          updatedFields,
        });
      }
    } catch (err) {
      errors += 1;
      report.push({
        uid: authUser.uid,
        email: resolved.email,
        displayName: resolved.displayName,
        slug: resolved.slug,
        profileUrl: resolved.profileUrl,
        role: resolved.role,
        action: 'error',
        updatedFields,
        error: err instanceof Error ? err.message : 'Unknown Firestore error',
      });
    }
  }

  return {
    projectId,
    dryRun,
    summary: {
      totalAuthUsers: authUsers.length,
      created,
      updated,
      unchanged,
      errors,
    },
    users: report,
  };
}

/**
 * Looks up a student/user profile on the server via Firestore REST API
 * using UID (document ID or `uid` field), `slug`, or `username`.
 */
export async function findStudentProfileServer(
  identifier: string
): Promise<StudentTalent | null> {
  const { raw, normalized } = normalizeStudentIdentifier(identifier);
  if (!raw) return null;

  let projectId = getFirebaseProjectId();
  let auth: RestAuth | null = null;

  if (isFirebaseAdminConfigured()) {
    try {
      const adminAuth = await getGoogleAdminAccessToken();
      projectId = adminAuth.projectId;
      auth = { type: 'bearer', token: adminAuth.accessToken };
    } catch {
      auth = null;
    }
  }

  if (!auth) {
    const apiKey = (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '').trim();
    if (!apiKey) {
      return null;
    }
    auth = { type: 'apiKey', key: apiKey };
  }

  const collections = ['users', 'students'];

  for (const col of collections) {
    try {
      const byDocId = await getFirestoreDocRest(projectId, col, raw, auth);
      if (byDocId) {
        return mapFirestoreDocToStudentTalent(byDocId.id, byDocId.data);
      }
    } catch {
      // Ignore permission/not-found errors and proceed through fallbacks
    }

    const equalityChecks: Array<[string, string]> = [
      ['slug', normalized],
      ['username', normalized],
    ];
    if (raw !== normalized) {
      equalityChecks.push(['slug', raw], ['username', raw]);
    }
    equalityChecks.push(['uid', raw]);

    for (const [fieldPath, val] of equalityChecks) {
      try {
        const match = await runFirestoreEqualityQueryRest(
          projectId,
          col,
          fieldPath,
          val,
          auth
        );
        if (match) {
          return mapFirestoreDocToStudentTalent(match.id, match.data);
        }
      } catch {
        // Ignore query/permission errors and continue
      }
    }
  }

  return null;
}

export interface ServerAdminUserRecord {
  id: string;
  uid: string;
  username: string;
  slug: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'نشط' | 'معلّق' | 'بانتظار الموافقة';
  organizationOrUniversity: string;
  createdAt?: string;
  joinedAt: string;
  createdAtMs: number;
  photoURL?: string;
  joinedMonth: string;
  sourceCollection: 'users' | 'students';
}

const VALID_SERVER_ROLES: readonly UserRole[] = [
  'student',
  'teacher',
  'company',
  'admin',
];

const AR_MONTHS_ADMIN = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

function normalizeServerUserStatus(
  raw?: unknown
): 'نشط' | 'معلّق' | 'بانتظار الموافقة' {
  if (typeof raw !== 'string' || !raw.trim()) return 'نشط';
  const s = raw.toLowerCase().trim();
  if (s === 'active' || s === 'نشط' || s === 'approved') return 'نشط';
  if (s === 'suspended' || s === 'معلّق' || s === 'blocked' || s === 'موقوف') {
    return 'معلّق';
  }
  if (s === 'pending' || s === 'بانتظار الموافقة' || s === 'قيد المراجعة') {
    return 'بانتظار الموافقة';
  }
  return 'نشط';
}

function mapRestDocToServerAdminUser(
  docId: string,
  data: Record<string, unknown>,
  sourceCollection: 'users' | 'students'
): ServerAdminUserRecord {
  const email =
    typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const isSuper = isSuperAdminEmail(email);

  const rawRole =
    typeof data.role === 'string' ? (data.role.trim() as UserRole) : undefined;
  const validRole: UserRole =
    rawRole && VALID_SERVER_ROLES.includes(rawRole) ? rawRole : 'student';

  const uid =
    typeof data.uid === 'string' && data.uid.trim() ? data.uid.trim() : docId;

  const slug = (
    (typeof data.slug === 'string' && data.slug.trim()) ||
    (typeof data.username === 'string' && data.username.trim()) ||
    extractSlugFromEmail(email, uid)
  ).toLowerCase();

  const rawCreated = data.createdAt || data.joinedAt;
  let createdAtStr = '';
  let createdAtMs = 0;
  let joinedAt = '—';
  let joinedMonth = 'نوفمبر';

  if (typeof rawCreated === 'string' && rawCreated.trim()) {
    const parsed = new Date(rawCreated.trim());
    if (!Number.isNaN(parsed.getTime())) {
      createdAtStr = parsed.toISOString();
      createdAtMs = parsed.getTime();
      joinedAt = createdAtStr.split('T')[0];
      joinedMonth = AR_MONTHS_ADMIN[parsed.getMonth()] || 'نوفمبر';
    }
  }

  return {
    id: docId,
    uid,
    username: slug,
    slug,
    name:
      (typeof data.name === 'string' && data.name.trim()) ||
      (typeof data.fullName === 'string' && data.fullName.trim()) ||
      (typeof data.displayName === 'string' && data.displayName.trim()) ||
      (email ? email.split('@')[0] : 'مستخدم مسجل'),
    email,
    role: isSuper ? 'admin' : validRole,
    status: isSuper ? 'نشط' : normalizeServerUserStatus(data.status),
    organizationOrUniversity:
      (typeof data.organizationOrUniversity === 'string' &&
        data.organizationOrUniversity.trim()) ||
      (typeof data.universityOrOrg === 'string' &&
        data.universityOrOrg.trim()) ||
      (typeof data.university === 'string' && data.university.trim()) ||
      (typeof data.institution === 'string' && data.institution.trim()) ||
      'جامعة الزرقاء',
    createdAt: createdAtStr || undefined,
    joinedAt,
    createdAtMs,
    photoURL:
      typeof data.photoURL === 'string' && data.photoURL.trim()
        ? data.photoURL.trim()
        : undefined,
    joinedMonth,
    sourceCollection,
  };
}

/**
 * Fetches all user documents from Firestore (`users` and legacy `students`)
 * without any limit for Admin Dashboard views when client rules are restricted.
 */
export async function listAllFirestoreUsersServer(): Promise<{
  projectId: string;
  totalCount: number;
  users: ServerAdminUserRecord[];
}> {
  const { accessToken, projectId } = await getGoogleAdminAccessToken();

  const usersDocs = await listFirestoreCollectionRest(
    projectId,
    'users',
    accessToken
  );
  const studentsDocs = await listFirestoreCollectionRest(
    projectId,
    'students',
    accessToken
  ).catch(() => [] as Array<{ id: string; data: Record<string, unknown> }>);

  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();
  const merged: ServerAdminUserRecord[] = [];

  const pushUnique = (item: ServerAdminUserRecord) => {
    const uidKey = item.uid || item.id;
    const emailKey = item.email ? item.email.toLowerCase().trim() : '';
    if (seenIds.has(item.id) || seenIds.has(uidKey)) return;
    if (emailKey && seenEmails.has(emailKey)) return;

    seenIds.add(item.id);
    if (uidKey) seenIds.add(uidKey);
    if (emailKey) seenEmails.add(emailKey);
    merged.push(item);
  };

  for (const docItem of usersDocs) {
    pushUnique(mapRestDocToServerAdminUser(docItem.id, docItem.data, 'users'));
  }
  for (const stuItem of studentsDocs) {
    pushUnique(
      mapRestDocToServerAdminUser(stuItem.id, stuItem.data, 'students')
    );
  }

  merged.sort((a, b) => {
    if (b.createdAtMs !== a.createdAtMs) {
      return b.createdAtMs - a.createdAtMs;
    }
    return a.name.localeCompare(b.name, 'ar');
  });

  return {
    projectId,
    totalCount: merged.length,
    users: merged,
  };
}
