/**
 * app.js — AI Coder application logic (compatibility shim)
 * The main application logic is now self-contained in index.html.
 * This file provides backward-compatible exports and helpers.
 */
(function () {
  'use strict';

  // Guard against double-initialization
  if (window.__appInitialized) return;
  window.__appInitialized = true;

  // Lucide icon refresh helper
  function refreshIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Re-export toast helper to window if not already defined
  if (!window.toast) {
    window.toast = function (message, type) {
      type = type || 'success';
      const stack = document.getElementById('toastStack');
      if (!stack) return;
      const el = document.createElement('div');
      el.className = 'toast ' + type;
      const icon = type === 'success' ? 'check-circle-2' : type === 'error' ? 'x-circle' : 'info';
      el.innerHTML =
        '<span class="toast-icon"><i data-lucide="' + icon + '"></i></span><span>' + message + '</span>';
      stack.appendChild(el);
      refreshIcons();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.classList.add('in');
        });
      });
      setTimeout(function () {
        el.classList.remove('in');
        setTimeout(function () {
          el.remove();
        }, 380);
      }, 3200);
    };
  }

  // Expose App interface
  window.App = {
    showToast: window.toast,
    loadSavedCodes: function () {
      if (typeof window.loadSavedCodes === 'function') window.loadSavedCodes();
    },
    navTo: function (page) {
      if (typeof window.navTo === 'function') window.navTo(page);
    },
  };
})();
