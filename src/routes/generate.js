/**
 * generate.js — Code generation route
 * Bug fix: corrected import path (was './src/services/openhands.js', should be '../services/openhands.js')
 */
import { callOpenHands } from '../services/openhands.js';

export async function generateCode(request, env) {
  try {
    const body = await request.json();
    const { prompt, language, framework } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fullPrompt = buildCodePrompt(prompt.trim(), language || 'javascript', framework || '');
    const code = await callOpenHands(fullPrompt, env);

    return new Response(JSON.stringify({ code }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Generate code error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate code' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function buildCodePrompt(prompt, language, framework) {
  let fullPrompt = `Write ${language} code that: ${prompt}. `;

  if (framework && framework !== '') {
    fullPrompt += `Use the ${framework} framework. `;
  }

  fullPrompt += `Return ONLY the code with no explanation, no markdown code fences, and no extra commentary. The code should be clean, well-commented, and production-ready.`;

  return fullPrompt;
}
