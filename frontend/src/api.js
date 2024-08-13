// src/api.js
import axios from 'axios';

const baseURL = 'http://localhost:3003'; // or whatever port your backend is running on

const api = axios.create({
  baseURL: baseURL,
});

export default api;