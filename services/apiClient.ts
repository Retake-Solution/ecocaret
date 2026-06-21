import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3002/api/v1',
  headers: {
    'Accept': '*/*'
  }
});

// You can easily add request/response interceptors here later
// apiClient.interceptors.request.use(...)

export default apiClient;
