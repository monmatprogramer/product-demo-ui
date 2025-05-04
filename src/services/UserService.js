// src/services/UserService.js
import axios from "axios";
import API_BASE_URL from "../utils/apiConfig";

export const UserService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch users");
    }
  },

  // Create a user (admin only)
  createUser: async (userData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create user");
    }
  },

  // Delete a user (admin only)
  deleteUser: async (userId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete user");
    }
  },

  // Update a user (admin only)
  updateUser: async (userId, userData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update user");
    }
  },
};

export default UserService;
