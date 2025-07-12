import axios from 'axios';

// Skills offered
export const getSkillsOffered = async () => {
  try {
    const response = await axios.get('/api/skills/offered');
    return response.data;
  } catch (error) {
    console.error('Error fetching skills offered:', error);
    throw error;
  }
};

export const getSkillOffered = async (skillId) => {
  try {
    const response = await axios.get(`/api/skills/offered/${skillId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching skill offered with ID ${skillId}:`, error);
    throw error;
  }
};

export const createSkillOffered = async (skillData) => {
  try {
    const response = await axios.post('/api/skills/offered', skillData);
    return response.data;
  } catch (error) {
    console.error('Error creating skill offered:', error);
    throw error;
  }
};

export const updateSkillOffered = async (skillId, skillData) => {
  try {
    const response = await axios.put(`/api/skills/offered/${skillId}`, skillData);
    return response.data;
  } catch (error) {
    console.error(`Error updating skill offered with ID ${skillId}:`, error);
    throw error;
  }
};

export const deleteSkillOffered = async (skillId) => {
  try {
    await axios.delete(`/api/skills/offered/${skillId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting skill offered with ID ${skillId}:`, error);
    throw error;
  }
};

// Skills wanted
export const getSkillsWanted = async () => {
  try {
    const response = await axios.get('/api/skills/wanted');
    return response.data;
  } catch (error) {
    console.error('Error fetching skills wanted:', error);
    throw error;
  }
};

export const getSkillWanted = async (skillId) => {
  try {
    const response = await axios.get(`/api/skills/wanted/${skillId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching skill wanted with ID ${skillId}:`, error);
    throw error;
  }
};

export const createSkillWanted = async (skillData) => {
  try {
    const response = await axios.post('/api/skills/wanted', skillData);
    return response.data;
  } catch (error) {
    console.error('Error creating skill wanted:', error);
    throw error;
  }
};

export const updateSkillWanted = async (skillId, skillData) => {
  try {
    const response = await axios.put(`/api/skills/wanted/${skillId}`, skillData);
    return response.data;
  } catch (error) {
    console.error(`Error updating skill wanted with ID ${skillId}:`, error);
    throw error;
  }
};

export const deleteSkillWanted = async (skillId) => {
  try {
    await axios.delete(`/api/skills/wanted/${skillId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting skill wanted with ID ${skillId}:`, error);
    throw error;
  }
};

// Skill search
export const searchSkills = async (query, skillType = null) => {
  try {
    const params = { query };
    if (skillType) {
      params.skill_type = skillType;
    }
    
    const response = await axios.get('/api/skills/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching skills:', error);
    throw error;
  }
};
