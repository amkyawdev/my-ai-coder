// Input Validation Utilities

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validatePrompt(prompt) {
  return prompt && prompt.trim().length >= 3;
}

export function validateCode(code) {
  return code && code.trim().length > 0;
}

export function validateTitle(title) {
  return title && title.trim().length > 0;
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, 10000); // Limit input length
}

export function validateLanguage(language) {
  const validLanguages = ['javascript', 'python', 'html', 'typescript', 'react', 'java', 'go', 'rust'];
  return validLanguages.includes(language);
}

export function validateFramework(framework) {
  const validFrameworks = ['', 'vanilla', 'express', 'nextjs', 'fastapi', 'flask', 'django', 'spring'];
  return validFrameworks.includes(framework);
}