import { callOpenHands } from './src/services/openhands.js';

export async function generateCode(request, env) {
  try {
    const body = await request.json();
    const { prompt, language, framework } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build the prompt for code generation
    const fullPrompt = buildCodePrompt(prompt, language, framework);

    // Call OpenHands AI to generate code
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
  let fullPrompt = `Generate ${language} code for: ${prompt}. `;
  
  if (framework && framework !== 'vanilla') {
    fullPrompt += `Use ${framework} framework. `;
  }
  
  fullPrompt += `Return only the code without any explanation or markdown formatting.`;
  
  return fullPrompt;
}