import { getDatabase } from '../services/database.js';
import { hashPassword, verifyPassword } from '../services/jwt.js';
import { generateToken } from '../services/jwt.js';

export async function login(request, env) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDatabase(env);
    const users = await db.execute({
      sql: `SELECT id, name, email, password FROM users WHERE email = ?`,
      args: [email],
    });

    if (users.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = users.rows[0];
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = generateToken(user, env);

    return new Response(JSON.stringify({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function register(request, env) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Name, email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user already exists
    const db = getDatabase(env);
    const existingUsers = await db.execute({
      sql: `SELECT id FROM users WHERE email = ?`,
      args: [email],
    });

    if (existingUsers.rows.length > 0) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const result = await db.execute({
      sql: `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      args: [name, email, hashedPassword],
    });

    const token = generateToken({
      id: result.lastInsertId,
      name,
      email,
    }, env);

    return new Response(JSON.stringify({
      token,
      user: {
        id: result.lastInsertId,
        name,
        email,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({ error: 'Registration failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}