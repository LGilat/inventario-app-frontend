import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Ahora apunta al puerto 4000
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
