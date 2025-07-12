import axios from 'axios';

// Swaps
export const getAllSwaps = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await axios.get('/api/swaps', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all swaps:', error);
    throw error;
  }
};

export const getSentSwaps = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await axios.get('/api/swaps/sent', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sent swaps:', error);
    throw error;
  }
};

export const getReceivedSwaps = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await axios.get('/api/swaps/received', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching received swaps:', error);
    throw error;
  }
};

export const getSwap = async (swapId) => {
  try {
    const response = await axios.get(`/api/swaps/${swapId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching swap with ID ${swapId}:`, error);
    throw error;
  }
};

export const createSwap = async (swapData) => {
  try {
    const response = await axios.post('/api/swaps', swapData);
    return response.data;
  } catch (error) {
    console.error('Error creating swap:', error);
    throw error;
  }
};

export const updateSwap = async (swapId, swapData) => {
  try {
    const response = await axios.put(`/api/swaps/${swapId}`, swapData);
    return response.data;
  } catch (error) {
    console.error(`Error updating swap with ID ${swapId}:`, error);
    throw error;
  }
};

export const deleteSwap = async (swapId) => {
  try {
    await axios.delete(`/api/swaps/${swapId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting swap with ID ${swapId}:`, error);
    throw error;
  }
};

// Feedback
export const createFeedback = async (feedbackData) => {
  try {
    const response = await axios.post('/api/swaps/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
};

export const getReceivedFeedback = async () => {
  try {
    const response = await axios.get('/api/swaps/feedback/received');
    return response.data;
  } catch (error) {
    console.error('Error fetching received feedback:', error);
    throw error;
  }
};

export const getGivenFeedback = async () => {
  try {
    const response = await axios.get('/api/swaps/feedback/given');
    return response.data;
  } catch (error) {
    console.error('Error fetching given feedback:', error);
    throw error;
  }
};

export const getSwapFeedback = async (swapId) => {
  try {
    const response = await axios.get(`/api/swaps/${swapId}/feedback`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching feedback for swap with ID ${swapId}:`, error);
    throw error;
  }
};
