import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

interface LoginCredentials {
  email: string;
  password: string;
}

export const loginUser = (credentials: LoginCredentials) => {
  // Cek "saklar" mode simulasi
  if (import.meta.env.VITE_API_MOCKING_ENABLED === 'true') {
    console.log('--- API MOCKING ENABLED ---');
    console.log('Credentials received:', credentials);
    // Jika mode simulasi aktif, kembalikan Promise yang selalu berhasil setelah 1 detik
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ data: { message: 'Login successful (mocked)', token: 'mock-jwt-token' } });
      }, 1000);
    });
  } else {
    // Jika mode simulasi tidak aktif, lakukan panggilan API sungguhan
    return apiClient.post('/login', credentials);
  }
};