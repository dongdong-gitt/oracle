import crypto from 'crypto';

export type AdminRole = 'SUPER_ADMIN' | 'OPERATOR';
export type AdminPermission =
  | 'dashboard'
  | 'users.read'
  | 'users.write'
  | 'archives.read'
  | 'archives.write'
  | 'orders.read'
  | 'orders.write'
  | 'ai.read'
  | 'ai.write'
  | 'logs.read';

export interface AdminSession {
  username: string;
  role: AdminRole;
  exp: number;
}

const COOKIE_NAME = 'oracle_admin_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

const permissionMatrix: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    'dashboard',
    'users.read',
    'users.write',
    'archives.read',
    'archives.write',
    'orders.read',
    'orders.write',
    'ai.read',
    'ai.write',
    'logs.read',
  ],
  OPERATOR: ['dashboard', 'users.read', 'archives.read', 'orders.read', 'ai.read', 'logs.read'],
};

function b64url(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromB64url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'oracle-local-admin-session-secret';
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getAdminSessionSecret()).update(payload).digest('base64url');
}

export function issueAdminToken(session: Omit<AdminSession, 'exp'>, maxAge = SESSION_MAX_AGE) {
  const content: AdminSession = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };
  const encoded = b64url(JSON.stringify(content));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyAdminToken(token?: string | null): AdminSession | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.', 2);
  if (!encoded || !signature) return null;
  if (sign(encoded) !== signature) return null;

  try {
    const parsed = JSON.parse(fromB64url(encoded)) as AdminSession;
    if (!parsed?.username || !parsed?.role || !parsed?.exp) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if (parsed.role !== 'SUPER_ADMIN' && parsed.role !== 'OPERATOR') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function parseCookie(rawCookie?: string | null) {
  const map: Record<string, string> = {};
  if (!rawCookie) return map;
  for (const part of rawCookie.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (!k) continue;
    map[k] = rest.join('=');
  }
  return map;
}

export function getAdminTokenFromRequest(request?: Request) {
  if (!request) return null;
  const cookies = parseCookie(request.headers.get('cookie'));
  return cookies[COOKIE_NAME] || null;
}

export function hasAdminPermission(role: AdminRole, permission: AdminPermission) {
  return permissionMatrix[role].includes(permission);
}

function matchAccount(username: string, password: string) {
  const superName = process.env.ADMIN_USERNAME || 'admin';
  const superPass = process.env.ADMIN_PASSWORD || 'admin123456';

  if (username === superName && password === superPass) {
    return { username, role: 'SUPER_ADMIN' as const };
  }

  const opName = process.env.ADMIN_OPERATOR_USERNAME || '';
  const opPass = process.env.ADMIN_OPERATOR_PASSWORD || '';
  if (opName && opPass && username === opName && password === opPass) {
    return { username, role: 'OPERATOR' as const };
  }

  return null;
}

export function authenticateAdmin(username: string, password: string) {
  const account = matchAccount(username, password);
  if (!account) return null;
  const token = issueAdminToken(account);
  return {
    ...account,
    token,
    cookieName: COOKIE_NAME,
    maxAge: SESSION_MAX_AGE,
  };
}

export function clearAdminCookieMeta() {
  return {
    name: COOKIE_NAME,
    value: '',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}

export function getAdminSessionFromRequest(request?: Request) {
  const token = getAdminTokenFromRequest(request);
  return verifyAdminToken(token);
}

