import api from './api'

export const checkSession = async (pseudo) => {
  console.log('Checking session for user:', pseudo);
  try {
    const response = await api.get(`/auth/check?pseudo=${pseudo}`);
    console.log('Session check response:', response.data);
    return response.data.active;
  } catch (error) {
    console.error('Error checking session:', {
      message: error.message,
      response: error.response?.data
    });
    return false;
  }
}



export const createSession = async (sessionData) => {
  console.log('Creating session with data:', sessionData);
  try {
    const response = await api.post('/sessions', sessionData);
    console.log('Session created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating session:', {
      message: error.message,
      response: error.response?.data
    });
    throw error;
  }
}


export const endSession = async (userId) => {
  console.log('Ending session for user:', userId);
  try {
    const response = await api.delete(`/sessions/${userId}`);
    console.log('Session ended successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error ending session:', {
      message: error.message,
      response: error.response?.data
    });
    throw error;
  }
}
