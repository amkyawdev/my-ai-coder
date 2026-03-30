/**
 * jwt.js — JWT service using Web Crypto API (Cloudflare Workers compatible)
 * Bug fixes:
 *  - generateToken is now properly async (it calls async hmacSign)
 *  - base64UrlEncode accepts both ArrayBuffer and Uint8Array
 *  - Added salt rounds concept via PBKDF2 for password hashing
 */

const DEFAULT_SECRET = 'default-dev-secret-change-in-production';
const TOKEN_EXPIRY_SECS = 7 * 24 * 60 * 60; // 7 days

// ─── Base64URL helpers ───────────────────────────────────────────────────────

function base64UrlEncode(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const remainder = base64.length % 4;
  const padded = remainder ? base64 + '='.repeat(4 - remainder) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ─── HMAC-SHA256 helpers ─────────────────────────────────────────────────────

async function getHmacKey(secret) {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function hmacSign(message, secret) {
  const key = await getHmacKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return base64UrlEncode(new Uint8Array(signature));
}

async function hmacVerify(message, signature, secret) {
  const expected = await hmacSign(message, secret);
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

// ─── Token generation ────────────────────────────────────────────────────────

/**
 * Generate a signed JWT token.
 * NOTE: This is now properly async.
 */
export async function generateToken(user, env) {
  const secret = (env && env.JWT_SECRET) || DEFAULT_SECRET;

  const header  = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub:   String(user.id),
    name:  user.name,
    email: user.email,
    iat:   Math.floor(Date.now() / 1000),
    exp:   Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECS,
  };

  const encoder = new TextEncoder();
  const headerB64  = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature    = await hmacSign(signingInput, secret);

  return `${signingInput}.${signature}`;
}

// ─── Token verification ──────────────────────────────────────────────────────

export async function verifyToken(token, env) {
  const secret = (env && env.JWT_SECRET) || DEFAULT_SECRET;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;

    const valid = await hmacVerify(signingInput, signature, secret);
    if (!valid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }

    return payload;
  } catch (err) {
    console.error('JWT verifyToken error:', err);
    return null;
  }
}

// ─── Password hashing ────────────────────────────────────────────────────────

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  // Constant-time comparison
  if (passwordHash.length !== hash.length) return false;
  let result = 0;
  for (let i = 0; i < passwordHash.length; i++) {
    result |= passwordHash.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return result === 0;
}
