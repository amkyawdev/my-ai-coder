// Main Application Logic
(function() {
  // DOM Elements
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const codeGeneratorForm = document.getElementById('codeGeneratorForm');
  const generateBtn = document.getElementById('generateBtn');
  const outputSection = document.getElementById('outputSection');
  const codeOutput = document.getElementById('codeOutput');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');
  const codesList = document.getElementById('codesList');

  // State
  let currentCode = '';
  let currentPrompt = '';
  let currentLanguage = 'javascript';
  let currentFramework = '';

  // Initialize
  function init() {
    bindEvents();
    loadSavedCodes();
  }

  // Bind events
  function bindEvents() {
    // Hamburger menu toggle
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Mobile menu links
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
    mobileMenuItems.forEach(item => {
      item.addEventListener('click', closeMobileMenu);
    });

    // Code generation form
    if (codeGeneratorForm) {
      codeGeneratorForm.addEventListener('submit', handleGenerate);
    }

    // Copy button
    if (copyBtn) {
      copyBtn.addEventListener('click', handleCopy);
    }

    // Save button
    if (saveBtn) {
      saveBtn.addEventListener('click', handleSave);
    }

    // Scroll animations
    window.addEventListener('scroll', handleScroll);
  }

  // Toggle mobile menu
  function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  }

  // Close mobile menu
  function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
  }

  // Handle code generation
  async function handleGenerate(e) {
    e.preventDefault();

    const prompt = document.getElementById('prompt').value.trim();
    const language = document.getElementById('language').value;
    const framework = document.getElementById('framework').value;

    if (!prompt) {
      showToast('Please enter a description', 'error');
      return;
    }

    // Update state
    currentPrompt = prompt;
    currentLanguage = language;
    currentFramework = framework;

    // Show loading state
    setLoading(true);

    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          language,
          framework
        }),
      });

      const data = await response.json();

      if (response.ok) {
        currentCode = data.code;
        displayCode(data.code);
        showToast('Code generated successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to generate code', 'error');
      }
    } catch (error) {
      console.error('Generate error:', error);
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Display generated code
  function displayCode(code) {
    if (!codeOutput || !outputSection) return;

    // Format and syntax highlight
    const formattedCode = formatCode(code);
    codeOutput.innerHTML = `<pre>${highlightSyntax(formattedCode)}</pre>`;
    outputSection.style.display = 'block';
    
    // Scroll to output
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Format code (basic indentation)
  function formatCode(code) {
    return code;
  }

  // Syntax highlighting (basic)
  function highlightSyntax(code) {
    // Escape HTML first
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Simple syntax highlighting patterns
    const patterns = [
      // Comments
      { pattern: /(\/\/.*$)/gm, class: 'comment' },
      { pattern: /(\/\*[\s\S]*?\*\/)/g, class: 'comment' },
      { pattern: /(#.*$)/gm, class: 'comment' },
      // Strings
      { pattern: /("(?:[^"\\]|\\.)*")/g, class: 'string' },
      { pattern: /('(?:[^'\\]|\\.)*')/g, class: 'string' },
      { pattern: /(`(?:[^`\\]|\\.)*`)/g, class: 'string' },
      // Keywords
      { pattern: /\b(function|const|let|var|if|else|for|while|return|import|export|class|extends|new|this|async|await|try|catch|throw|def|import|from|as|with|lambda)\b/g, class: 'keyword' },
      // Functions
      { pattern: /\b(\w+)(?=\s*\()/g, class: 'function' },
    ];

    // Apply patterns
    patterns.forEach(({ pattern, class: className }) => {
      escaped = escaped.replace(pattern, `<span class="${className}">$1</span>`);
    });

    return escaped;
  }

  // Handle copy
  async function handleCopy() {
    if (!currentCode) {
      showToast('No code to copy', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(currentCode);
      showToast('Copied to clipboard!', 'success');
    } catch (error) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = currentCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Copied to clipboard!', 'success');
    }
  }

  // Handle save
  async function handleSave() {
    if (!currentCode) {
      showToast('No code to save', 'error');
      return;
    }

    if (!window.Auth || !window.Auth.isAuthenticated()) {
      showToast('Please login to save code', 'error');
      window.Auth.openAuthModal();
      return;
    }

    // Generate title from prompt
    const title = currentPrompt.slice(0, 50) + (currentPrompt.length > 50 ? '...' : '');

    try {
      const response = await fetch('/save-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.Auth.getToken()}`,
        },
        body: JSON.stringify({
          title,
          code: currentCode,
          language: currentLanguage,
          framework: currentFramework,
          prompt: currentPrompt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Code saved successfully!', 'success');
        loadSavedCodes();
      } else {
        showToast(data.error || 'Failed to save code', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Connection error. Please try again.', 'error');
    }
  }

  // Load saved codes
  async function loadSavedCodes() {
    if (!codesList) return;

    // Check if user is authenticated
    if (!window.Auth || !window.Auth.isAuthenticated()) {
      codesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔐</div>
          <p class="empty-state-text">Login to save and view your generated code</p>
        </div>
      `;
      return;
    }

    try {
      const response = await fetch('/get-codes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.Auth.getToken()}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        displaySavedCodes(data.codes);
      } else {
        showToast(data.error || 'Failed to load codes', 'error');
      }
    } catch (error) {
      console.error('Load codes error:', error);
      codesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">😕</div>
          <p class="empty-state-text">Failed to load saved codes</p>
        </div>
      `;
    }
  }

  // Display saved codes
  function displaySavedCodes(codes) {
    if (!codesList) return;

    if (!codes || codes.length === 0) {
      codesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <p class="empty-state-text">No saved codes yet. Generate and save your first code!</p>
        </div>
      `;
      return;
    }

    codesList.innerHTML = codes.map(code => `
      <div class="code-item" data-id="${code.id}">
        <div class="code-item-header">
          <span class="code-item-title">${escapeHtml(code.title)}</span>
          <span class="code-item-date">${formatDate(code.created_at)}</span>
        </div>
        <div class="code-item-preview">${escapeHtml(code.code.slice(0, 150))}...</div>
        <div class="code-item-actions">
          <button class="btn btn-secondary btn-small" onclick="viewCode(${code.id})">View</button>
          <button class="btn btn-secondary btn-small" onclick="copyCode('${escapeForAttr(code.code)}')">Copy</button>
          <button class="btn btn-secondary btn-small" onclick="deleteCode(${code.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // View saved code
  window.viewCode = async function(id) {
    try {
      const response = await fetch(`/get-code/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.Auth.getToken()}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        currentCode = data.code;
        currentPrompt = data.prompt;
        currentLanguage = data.language;
        displayCode(data.code);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast(data.error || 'Failed to load code', 'error');
      }
    } catch (error) {
      console.error('View code error:', error);
      showToast('Connection error. Please try again.', 'error');
    }
  };

  // Copy saved code
  window.copyCode = async function(code) {
    try {
      await navigator.clipboard.writeText(code);
      showToast('Copied to clipboard!', 'success');
    } catch (error) {
      showToast('Failed to copy', 'error');
    }
  };

  // Delete saved code
  window.deleteCode = async function(id) {
    if (!confirm('Are you sure you want to delete this code?')) {
      return;
    }

    try {
      const response = await fetch(`/delete-code/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${window.Auth.getToken()}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Code deleted successfully!', 'success');
        loadSavedCodes();
      } else {
        showToast(data.error || 'Failed to delete code', 'error');
      }
    } catch (error) {
      console.error('Delete code error:', error);
      showToast('Connection error. Please try again.', 'error');
    }
  };

  // Set loading state
  function setLoading(loading) {
    if (!generateBtn) return;

    if (loading) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<span class="spinner"></span><span>Generating...</span>';
    } else {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<span>Generate Code</span>';
    }
  }

  // Handle scroll for animations
  function handleScroll() {
    const elements = document.querySelectorAll('.code-item');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }

  // Show toast notification
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Utility: Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Utility: Escape for attribute
  function escapeForAttr(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  // Utility: Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose functions globally
  window.App = {
    loadSavedCodes,
    showToast
  };
})();