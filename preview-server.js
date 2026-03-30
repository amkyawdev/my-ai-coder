/**
 * preview-server.js — Local preview server for UI development
 * Serves index.html and static files. API routes return mock data.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// Mock users store (in-memory)
const users = [];
const savedCodes = [];
let nextUserId = 1;
let nextCodeId = 1;

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const ct  = MIME[ext] || 'text/plain';
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': ct });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function simpleJwt(payload) {
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 86400000 })).toString('base64url');
  return `${h}.${p}.mock-signature`;
}

function verifyJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

function getUserFromReq(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return verifyJwt(auth.slice(7));
}

const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;
  const p      = url.pathname;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    });
    return res.end();
  }

  // ── API Routes ───────────────────────────────────────────────────

  // Auth: Register
  if (p === '/auth/register' && method === 'POST') {
    const { name, email, password } = await readBody(req);
    if (!name || !email || !password) return json(res, { error: 'All fields required' }, 400);
    if (password.length < 8) return json(res, { error: 'Password must be at least 8 characters' }, 400);
    if (users.find(u => u.email === email)) return json(res, { error: 'Email already registered' }, 409);
    const user = { id: nextUserId++, name, email, password };
    users.push(user);
    const token = simpleJwt({ sub: user.id, name, email });
    return json(res, { token, user: { id: user.id, name, email } }, 201);
  }

  // Auth: Login
  if (p === '/auth/login' && method === 'POST') {
    const { email, password } = await readBody(req);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return json(res, { error: 'Invalid credentials' }, 401);
    const token = simpleJwt({ sub: user.id, name: user.name, email: user.email });
    return json(res, { token, user: { id: user.id, name: user.name, email: user.email } });
  }

  // Generate code (mock)
  if (p === '/generate' && method === 'POST') {
    const { prompt, language, framework } = await readBody(req);
    if (!prompt) return json(res, { error: 'Prompt is required' }, 400);
    const fw = framework ? ` using ${framework}` : '';
    const code = `// ${language || 'javascript'} code${fw}\n// Generated for: ${prompt}\n\n` +
      (language === 'python'
        ? `def main():\n    """${prompt}"""\n    # TODO: Implement\n    print("Hello from AI Coder!")\n    return True\n\nif __name__ == "__main__":\n    result = main()\n    print("Result:", result)`
        : `async function main() {\n  // ${prompt}\n  const result = await processRequest();\n  return result;\n}\n\nasync function processRequest() {\n  // Implementation\n  console.log("AI Coder generated code!");\n  return { success: true, data: null };\n}\n\nmain().then(console.log).catch(console.error);`);
    return json(res, { code });
  }

  // Chat (mock)
  if (p === '/chat' && method === 'POST') {
    const { message } = await readBody(req);
    const response = `Great question! For "${message}", here's what I'd suggest:\n\n` +
      `1. Start by breaking the problem into smaller parts\n` +
      `2. Use the Generate tab to create the initial code\n` +
      `3. Iterate and refine as needed\n\n` +
      `Is there a specific aspect you'd like me to focus on?`;
    return json(res, { response });
  }

  // Save code (requires auth)
  if (p === '/save-code' && method === 'POST') {
    const user = getUserFromReq(req);
    if (!user) return json(res, { error: 'Authorization required' }, 401);
    const body = await readBody(req);
    const code = { id: nextCodeId++, user_id: user.sub, created_at: new Date().toISOString(), ...body };
    savedCodes.push(code);
    return json(res, { success: true, id: code.id }, 201);
  }

  // Get codes (requires auth)
  if (p === '/get-codes' && method === 'GET') {
    const user = getUserFromReq(req);
    if (!user) return json(res, { error: 'Authorization required' }, 401);
    const codes = savedCodes.filter(c => c.user_id === user.sub).sort((a,b) => b.id - a.id);
    return json(res, { codes });
  }

  // Get single code
  const getMatch = p.match(/^\/get-code\/(\d+)$/);
  if (getMatch && method === 'GET') {
    const user = getUserFromReq(req);
    if (!user) return json(res, { error: 'Authorization required' }, 401);
    const code = savedCodes.find(c => c.id === parseInt(getMatch[1]) && c.user_id === user.sub);
    if (!code) return json(res, { error: 'Code not found' }, 404);
    return json(res, code);
  }

  // Delete code
  const delMatch = p.match(/^\/delete-code\/(\d+)$/);
  if (delMatch && method === 'DELETE') {
    const user = getUserFromReq(req);
    if (!user) return json(res, { error: 'Authorization required' }, 401);
    const idx = savedCodes.findIndex(c => c.id === parseInt(delMatch[1]) && c.user_id === user.sub);
    if (idx === -1) return json(res, { error: 'Code not found' }, 404);
    savedCodes.splice(idx, 1);
    return json(res, { success: true });
  }

  // ── Static Files ─────────────────────────────────────────────────

  if (p === '/' || p === '/index.html') {
    return serveFile(res, path.join(__dirname, 'index.html'));
  }

  if (p.startsWith('/public/')) {
    return serveFile(res, path.join(__dirname, p));
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 AI Coder preview server running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}\n`);
});
