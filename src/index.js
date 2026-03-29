import { generateCode } from './src/routes/generate.js';
import { saveCode, getCodes, getCode, deleteCode } from './src/routes/save-code.js';
import { login, register } from './src/routes/auth.js';
import { corsMiddleware } from './src/utils/cors.js';
import { authMiddleware } from './src/utils/auth.js';

export default {
  async fetch(request, env, ctx) {
    // Apply CORS middleware
    const corsResponse = corsMiddleware(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      // Route handling
      if (path === '/generate' && method === 'POST') {
        return await generateCode(request, env);
      }

      if (path === '/save-code' && method === 'POST') {
        return authMiddleware(request, env, async () => {
          return await saveCode(request, env);
        });
      }

      if (path === '/get-codes' && method === 'GET') {
        return authMiddleware(request, env, async () => {
          return await getCodes(request, env);
        });
      }

      if (path.match(/^\/get-code\/\d+$/) && method === 'GET') {
        const id = parseInt(path.split('/').pop());
        return authMiddleware(request, env, async () => {
          return await getCode(request, env, id);
        });
      }

      if (path.match(/^\/delete-code\/\d+$/) && method === 'DELETE') {
        const id = parseInt(path.split('/').pop());
        return authMiddleware(request, env, async () => {
          return await deleteCode(request, env, id);
        });
      }

      if (path === '/auth/login' && method === 'POST') {
        return await login(request, env);
      }

      if (path === '/auth/register' && method === 'POST') {
        return await register(request, env);
      }

      // Serve static files
      if (path === '/' || path === '/index.html') {
        return new Response(await import('./index.html'), {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (path.startsWith('/public/')) {
        const filePath = '.' + path;
        const file = await import(filePath);
        const contentType = getContentType(path);
        return new Response(file.default, {
          headers: { 'Content-Type': contentType },
        });
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};

function getContentType(path) {
  const ext = path.split('.').pop();
  const types = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    svg: 'image/svg+xml',
  };
  return types[ext] || 'text/plain';
}