// src/api.js
import axios from 'axios';

// const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';
const baseURL = 'https://crypto-dashboard-api.melody-hch.workers.dev/';

const api = axios.create({
  baseURL: baseURL,
});

export default api;