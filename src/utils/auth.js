// Auth Middleware
import { verifyToken } from '../services/jwt.js';

export function authMiddleware(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Authorization required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token, env);

  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Attach user ID to request for use in route handlers
  request.userId = payload.sub;
  request.user = payload;

  return null; // Continue to next middleware/handler
}

// Wrapper to use authMiddleware in route handlers
export function withAuth(handler) {
  return async function(request, env, ctx) {
    const authResponse = authMiddleware(request, env);
    if (authResponse) return authResponse;
    return handler(request, env, ctx);
  };
}