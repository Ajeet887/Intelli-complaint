import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const submitTextComplaint = async (text) => {
  const response = await api.post('/submit-text', {
    input_type: 'text',
    original_text: text,
    processed_text: '',
    language: 'auto'
  });
  return response.data;
};

export const submitVoiceComplaint = async (audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  const response = await api.post('/submit-voice', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getComplaints = async () => {
  const response = await api.get('/complaints');
  return response.data;
};

export const updateComplaintStatus = async (id, status) => {
  const response = await api.put(`/complaints/${id}/status`, { status });
  return response.data;
};
