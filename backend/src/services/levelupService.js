import axios from 'axios';

const LEVELUP_API = 'https://api.levelupsportctg.com/api';
let cachedToken = null;
let tokenExpiry = null;

const getAdminToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await axios.post(`${LEVELUP_API}/auth/login`, {
    email: 'admin@level.com',
    password: 'admin123'
  });

  cachedToken = response.data.token;
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return cachedToken;
};

const getLevelUpClient = async () => {
  const token = await getAdminToken();
  return axios.create({
    baseURL: LEVELUP_API,
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getUsers = async () => {
  const client = await getLevelUpClient();
  const response = await client.get('/users?role=client');
  return response.data;
};

export const getClasses = async () => {
  const client = await getLevelUpClient();
  const response = await client.get('/classes');
  return response.data;
};

export const getTransacciones = async () => {
  const client = await getLevelUpClient();
  const response = await client.get('/wompi/transacciones');
  return response.data;
};

export const enrollUser = async (classId, userId) => {
  const client = await getLevelUpClient();
  const response = await client.post(`/classes/${classId}/enroll`, { userId });
  return response.data;
};

export const updateUserSolvencia = async (userId, fechaVencimiento) => {
  const client = await getLevelUpClient();
  const response = await client.put(`/users/${userId}`, {
    fechaVencimiento,
    estadoPlan: 'ACTIVO'
  });
  return response.data;
};
