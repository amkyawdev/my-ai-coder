// Auth UI Logic
(function() {
  // DOM Elements
  const authModal = document.getElementById('authModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const modalTabs = document.querySelectorAll('.modal-tab');
  const desktopLoginBtn = document.getElementById('loginBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const userSection = document.getElementById('userSection');
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');

  // State
  let currentUser = null;

  // Initialize
  function init() {
    checkAuth();
    bindEvents();
    updateLucideIcons();
  }

  // Check if user is logged in
  function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        currentUser = JSON.parse(user);
        updateUIForLoggedIn();
      } catch (e) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }

  // Update UI when logged in
  function updateUIForLoggedIn() {
    if (desktopLoginBtn) {
      desktopLoginBtn.style.display = 'none';
    }
    
    if (mobileLoginBtn) {
      mobileLoginBtn.innerHTML = '<i data-lucide="log-out"></i>Logout';
    }

    // Create or update user section
    if (userSection && userAvatar && userName && currentUser) {
      userSection.classList.add('active');
      userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
      userName.textContent = currentUser.name;
      updateLucideIcons();
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

  // Update Lucide icons
  function updateLucideIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // Open auth modal
  function openAuthModal() {
    if (authModal) {
      authModal.classList.add('active');
      updateLucideIcons();
    }
  }

  // Close auth modal
  function closeAuthModal() {
    if (authModal) {
      authModal.classList.remove('active');
      if (loginForm) loginForm.reset();
      if (registerForm) registerForm.reset();
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
    updateLucideIcons();
  }

  // Handle mobile login
  function handleMobileLogin() {
    if (currentUser) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        updateUIForLoggedIn();
        closeAuthModal();
        showToast('Welcome back!', 'success');
        if (typeof loadSavedCodes === 'function') loadSavedCodes();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        updateUIForLoggedIn();
        closeAuthModal();
        showToast('Account created successfully!', 'success');
        if (typeof loadSavedCodes === 'function') loadSavedCodes();
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

    if (desktopLoginBtn) desktopLoginBtn.style.display = 'inline-flex';
    if (mobileLoginBtn) {
      mobileLoginBtn.innerHTML = '<i data-lucide="log-in"></i>Login';
    }
    if (userSection) userSection.classList.remove('active');

    showToast('Logged out successfully', 'success');
    updateLucideIcons();
  }

  // Show toast notification
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : 'x-circle'}" class="toast-icon"></i>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);
    updateLucideIcons();

    setTimeout(() => toast.classList.add('show'), 10);
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
  window.Auth = { isAuthenticated, getToken, logout, openAuthModal, showToast };
})();