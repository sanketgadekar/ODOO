import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios to use token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/users/me');
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Session expired. Please login again.');
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Using FormData for OAuth2 compatibility
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post('/api/auth/login', formData);
      
      setToken(response.data.access_token);
      
      // Fetch user profile
      const userResponse = await axios.get('/api/users/me');
      setUser(userResponse.data);
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      await axios.post('/api/auth/register', userData);
      setError(null);
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.put('/api/users/me', userData);
      setUser(response.data);
      setError(null);
      return true;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.detail || 'Profile update failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/users/me/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUser(response.data);
      setError(null);
      return true;
    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err.response?.data?.detail || 'Photo upload failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    uploadProfilePhoto,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
