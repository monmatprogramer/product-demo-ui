// src/services/AuthService.js
import HttpClient from './HttpClient';

/**
 * Service for handling authentication-related API requests
 */
export const AuthService = {
  /**
   * Login user and get tokens
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<Object>} Auth response with token
   */
  login: async (username, password) => {
    try {
      return await HttpClient.post('/auth/login', { username, password }, false);
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  /**
   * Register a new user
   * @param {Object} userData User registration data
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    try {
      return await HttpClient.post('/auth/register', userData, false);
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken 
   * @returns {Promise<Object>} New token response
   */
  refreshToken: async (refreshToken) => {
    try {
      return await HttpClient.post('/auth/refresh', { refreshToken }, false);
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  },

  /**
   * Request password reset
   * @param {string} email 
   * @returns {Promise<Object>} Response 
   */
  forgotPassword: async (email) => {
    try {
      await HttpClient.post('/auth/forgot-password', { email }, false);
      return { success: true };
    } catch (error) {
      // We don't throw an error here because we don't want to reveal
      // if the email exists in the system
      return { success: false };
    }
  },

  /**
   * Reset password with token
   * @param {string} resetToken 
   * @param {string} newPassword 
   * @returns {Promise<Object>} Response
   */
  resetPassword: async (resetToken, newPassword) => {
    try {
      return await HttpClient.post('/auth/reset-password', { 
        token: resetToken, 
        password: newPassword 
      }, false);
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile
   */
  getProfile: async () => {
    try {
      return await HttpClient.get('/auth/profile');
    } catch (error) {
      throw new Error('Failed to get user profile');
    }
  }
};

export default AuthService;