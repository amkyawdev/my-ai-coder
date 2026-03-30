/**
 * auth.js — Auth middleware for Cloudflare Workers
 * Bug fixes:
 *  - authMiddleware now accepts (request, env, next) signature to match usage in src/index.js
 *  - verifyToken is async — middleware now properly awaits it
 *  - Attaches userId and user to request object correctly
 */
import { verifyToken } from '../services/jwt.js';

/**
 * Auth middleware.
 * Usage: authMiddleware(request, env, async () => handler())
 */
export async function authMiddleware(request, env, next) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Authorization required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token missing' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = await verifyToken(token, env);

  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Attach decoded user info to request
  request.userId = payload.sub;
  request.user   = payload;

  // Call the next handler
  return next();
}
