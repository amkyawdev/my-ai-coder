/**
 * save-code.js — Saved codes CRUD routes
 * Bug fix: updated DB queries to use Neon tagged-template syntax (db`...`)
 * instead of db.execute({sql, args}) which is a libsql/Turso pattern, not Neon.
 */
import { getDatabase } from '../services/database.js';

export async function saveCode(request, env) {
  try {
    const body = await request.json();
    const { title, code, language, framework, prompt } = body;
    const userId = request.userId;

    if (!title || !code) {
      return new Response(JSON.stringify({ error: 'Title and code are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDatabase(env);
    const result = await db`
      INSERT INTO saved_codes (user_id, title, code, language, framework, prompt)
      VALUES (${userId}, ${title}, ${code}, ${language || 'javascript'}, ${framework || ''}, ${prompt || ''})
      RETURNING id
    `;

    return new Response(JSON.stringify({ success: true, id: result[0]?.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Save code error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save code' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function getCodes(request, env) {
  try {
    const userId = request.userId;
    const db = getDatabase(env);

    const codes = await db`
      SELECT id, title, code, language, framework, prompt, created_at
      FROM saved_codes
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return new Response(JSON.stringify({ codes: codes || [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get codes error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get codes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function getCode(request, env, id) {
  try {
    const userId = request.userId;
    const db = getDatabase(env);

    const codes = await db`
      SELECT id, title, code, language, framework, prompt, created_at
      FROM saved_codes
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1
    `;

    if (!codes || codes.length === 0) {
      return new Response(JSON.stringify({ error: 'Code not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(codes[0]), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get code error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get code' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function deleteCode(request, env, id) {
  try {
    const userId = request.userId;
    const db = getDatabase(env);

    const result = await db`
      DELETE FROM saved_codes
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (!result || result.length === 0) {
      return new Response(JSON.stringify({ error: 'Code not found or already deleted' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete code error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete code' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
