// Auth UI Logic
(function() {
  // DOM Elements
  const authModal = document.getElementById('authModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const modalTabs = document.querySelectorAll('.modal-tab');
  const desktopLoginBtn = document.getElementById('desktopLoginBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const userSection = document.getElementById('userSection');
  const userName = document.getElementById('userName');

  // State
  let currentUser = null;

  // Initialize
  function init() {
    checkAuth();
    bindEvents();
  }

  // Check if user is logged in
  function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      currentUser = JSON.parse(user);
      updateUIForLoggedIn();
    }
  }

  // Update UI when logged in
  function updateUIForLoggedIn() {
    if (desktopLoginBtn) {
      desktopLoginBtn.style.display = 'none';
    }
    
    if (mobileLoginBtn) {
      mobileLoginBtn.textContent = 'Logout';
      mobileLoginBtn.classList.remove('primary');
    }

    // Create user section
    const header = document.querySelector('.header');
    const existingUserSection = header.querySelector('.user-section');
    
    if (!existingUserSection) {
      const userSectionEl = document.createElement('div');
      userSectionEl.className = 'user-section active';
      userSectionEl.innerHTML = `
        <div class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
        <span class="user-name">${currentUser.name}</span>
      `;
      header.insertBefore(userSectionEl, header.querySelector('.hamburger'));
    }
  }

  // Bind events
  function bindEvents() {
    // Login buttons
    if (desktopLoginBtn) {
      desktopLoginBtn.addEventListener('click', openAuthModal);
    }
    
    if (mobileLoginBtn) {
      mobileLoginBtn.addEventListener('click', handleMobileLogin);
    }

    // Modal tabs
    modalTabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Login form
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
    }

    // Close modal on overlay click
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
          closeAuthModal();
        }
      });
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && authModal && authModal.classList.contains('active')) {
        closeAuthModal();
      }
    });
  }

  // Open auth modal
  function openAuthModal() {
    if (authModal) {
      authModal.classList.add('active');
    }
  }

  // Close auth modal
  function closeAuthModal() {
    if (authModal) {
      authModal.classList.remove('active');
      // Reset forms
      loginForm.reset();
      registerForm.reset();
    }
  }

  // Switch between login/register tabs
  function switchTab(tab) {
    modalTabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    if (tab === 'login') {
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
    } else {
      loginForm.classList.remove('active');
      registerForm.classList.add('active');
    }
  }

  // Handle mobile login
  function handleMobileLogin() {
    if (currentUser) {
      // Logout
      logout();
    } else {
      openAuthModal();
    }
  }

  // Handle login
  async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        currentUser = data.user;
        updateUIForLoggedIn();
        closeAuthModal();
        
        showToast('Welcome back!', 'success');
        
        // Refresh saved codes if on page
        if (typeof loadSavedCodes === 'function') {
          loadSavedCodes();
        }
      } else {
        showToast(data.error || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Connection error. Please try again.', 'error');
    }
  }

  // Handle register
  async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        currentUser = data.user;
        updateUIForLoggedIn();
        closeAuthModal();
        
        showToast('Account created successfully!', 'success');
        
        // Refresh saved codes if on page
        if (typeof loadSavedCodes === 'function') {
          loadSavedCodes();
        }
      } else {
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Register error:', error);
      showToast('Connection error. Please try again.', 'error');
    }
  }

  // Logout
  function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    currentUser = null;

    // Reset UI
    if (desktopLoginBtn) {
      desktopLoginBtn.style.display = 'inline-flex';
    }
    
    if (mobileLoginBtn) {
      mobileLoginBtn.textContent = 'Login';
      mobileLoginBtn.classList.add('primary');
    }

    // Remove user section
    const userSectionEl = document.querySelector('.user-section');
    if (userSectionEl) {
      userSectionEl.remove();
    }

    showToast('Logged out successfully', 'success');
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

  // Check if user is authenticated
  function isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Get auth token
  function getToken() {
    return localStorage.getItem('authToken');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose functions globally
  window.Auth = {
    isAuthenticated,
    getToken,
    logout,
    openAuthModal,
    showToast
  };
})();