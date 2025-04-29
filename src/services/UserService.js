// src/services/UserService.js
import HttpClient from './HttpClient';

/**
 * Service for handling user-related API requests
 */
export const UserService = {
  /**
   * Get a list of all users (admin only)
   * @returns {Promise<Array>} List of users
   */
  getAllUsers: async () => {
    try {
      return await HttpClient.get('/users');
    } catch (error) {
      throw new Error(error.message || 'Failed to get users');
    }
  },

  /**
   * Get a user by ID
   * @param {number} userId 
   * @returns {Promise<Object>} User data
   */
  getUserById: async (userId) => {
    try {
      return await HttpClient.get(`/users/${userId}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to get user');
    }
  },

  /**
   * Create a new user (admin only)
   * @param {Object} userData 
   * @returns {Promise<Object>} Created user
   */
  createUser: async (userData) => {
    try {
      return await HttpClient.post('/users', userData);
    } catch (error) {
      throw new Error(error.message || 'Failed to create user');
    }
  },

  /**
   * Update a user
   * @param {number} userId 
   * @param {Object} userData 
   * @returns {Promise<Object>} Updated user
   */
  updateUser: async (userId, userData) => {
    try {
      return await HttpClient.put(`/users/${userId}`, userData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update user');
    }
  },

  /**
   * Delete a user (admin only)
   * @param {number} userId 
   * @returns {Promise<void>}
   */
  deleteUser: async (userId) => {
    try {
      return await HttpClient.delete(`/users/${userId}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  /**
   * Update current user profile
   * @param {Object} profileData 
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (profileData) => {
    try {
      return await HttpClient.put('/users/profile', profileData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise<Object>} Response
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      return await HttpClient.post('/users/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  }
};

export default UserService;