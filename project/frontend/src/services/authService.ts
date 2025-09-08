import axios from 'axios';

const API_URL = 'http://localhost:5000/auth';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export const loginUser = (credentials: LoginCredentials) => {
  return apiClient.post('/login', credentials);
};

export const registerUser = (credentials: RegisterCredentials) => {
  return apiClient.post('/register', credentials);
};