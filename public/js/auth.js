/**
 * auth.js — Authentication helpers (compatibility shim)
 * The full auth logic is self-contained in index.html.
 * This file exposes the window.Auth API for any external consumers.
 */
(function () {
  'use strict';

  // Guard against double-initialization
  if (window.Auth) return;

  window.Auth = {
    isAuthenticated: function () {
      return !!localStorage.getItem('authToken');
    },
    getToken: function () {
      return localStorage.getItem('authToken') || null;
    },
    getUser: function () {
      try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    logout: function () {
      if (typeof window.doLogout === 'function') {
        window.doLogout();
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        location.reload();
      }
    },
    openAuthModal: function () {
      if (typeof window.navTo === 'function') {
        window.navTo('login');
      }
    },
    showToast: function (msg, type) {
      if (typeof window.toast === 'function') window.toast(msg, type || 'success');
    },
  };
})();
