import axios from 'axios';

// User management
export const getAllUsers = async (skip = 0, limit = 100) => {
  try {
    const response = await axios.get('/api/admin/users', { params: { skip, limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const banUser = async (userId) => {
  try {
    const response = await axios.put(`/api/admin/users/${userId}/ban`);
    return response.data;
  } catch (error) {
    console.error(`Error banning user with ID ${userId}:`, error);
    throw error;
  }
};

export const unbanUser = async (userId) => {
  try {
    const response = await axios.put(`/api/admin/users/${userId}/unban`);
    return response.data;
  } catch (error) {
    console.error(`Error unbanning user with ID ${userId}:`, error);
    throw error;
  }
};

export const makeUserAdmin = async (userId) => {
  try {
    const response = await axios.put(`/api/admin/users/${userId}/make-admin`);
    return response.data;
  } catch (error) {
    console.error(`Error making user with ID ${userId} an admin:`, error);
    throw error;
  }
};

// Skill moderation
export const getPendingSkills = async () => {
  try {
    const response = await axios.get('/api/admin/skills/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending skills:', error);
    throw error;
  }
};

export const approveSkill = async (skillId) => {
  try {
    const response = await axios.put(`/api/admin/skills/${skillId}/approve`);
    return response.data;
  } catch (error) {
    console.error(`Error approving skill with ID ${skillId}:`, error);
    throw error;
  }
};

export const rejectSkill = async (skillId) => {
  try {
    const response = await axios.put(`/api/admin/skills/${skillId}/reject`);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting skill with ID ${skillId}:`, error);
    throw error;
  }
};

// Swap monitoring
export const getAllSwaps = async (status = null, skip = 0, limit = 100) => {
  try {
    const params = { skip, limit };
    if (status) {
      params.status = status;
    }
    
    const response = await axios.get('/api/admin/swaps', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all swaps:', error);
    throw error;
  }
};

// Statistics
export const getPlatformStats = async () => {
  try {
    const response = await axios.get('/api/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    throw error;
  }
};

// Platform-wide messaging
export const sendPlatformMessage = async (title, message) => {
  try {
    const response = await axios.post('/api/admin/message', { title, message });
    return response.data;
  } catch (error) {
    console.error('Error sending platform-wide message:', error);
    throw error;
  }
};
