import axios from 'axios'
import { BASE_URL } from './constants'

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 500000
});

instance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${process.env.GENDATA_API_KEY}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    const data = response.data;
    return data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance