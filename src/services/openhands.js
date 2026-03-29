// OpenHands AI Service for code generation
export async function callOpenHands(prompt, env) {
  const apiKey = env.OPENAI_API_KEY || env.AMKYAWDEV_KAY;
  
  if (!apiKey) {
    // Fallback: Generate simple placeholder code
    return generateFallbackCode(prompt);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a code generator. Generate clean, working code based on the user\'s description. Return only the code without any explanation or markdown formatting. Use best practices and modern syntax.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const code = data.choices[0]?.message?.content || '';

    // Clean up the code (remove markdown code blocks if present)
    return cleanCode(code);
  } catch (error) {
    console.error('OpenHands API error:', error);
    return generateFallbackCode(prompt);
  }
}

function cleanCode(code) {
  // Remove markdown code blocks
  let cleaned = code.replace(/^```[\w]*\n?/, '');
  cleaned = cleaned.replace(/```$/, '');
  cleaned = cleaned.trim();
  
  return cleaned;
}

function generateFallbackCode(prompt) {
  // Simple fallback code generator based on keywords
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('button')) {
    return `// Button Component
document.querySelector('.btn-primary')?.addEventListener('click', () => {
  console.log('Button clicked!');
});`;
  }
  
  if (lowerPrompt.includes('form') || lowerPrompt.includes('input')) {
    return `// Form Handler
const form = document.querySelector('form');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  console.log(Object.fromEntries(formData));
});`;
  }
  
  if (lowerPrompt.includes('api') || lowerPrompt.includes('fetch')) {
    return `// API Fetch Example
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`;
  }
  
  // Default: JavaScript function
  return `// Generated Code
function processData(input) {
  // TODO: Implement ${prompt}
  console.log('Processing:', input);
  return input;
}

// Example usage
const result = processData('Hello, World!');
console.log(result);`;
}