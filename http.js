const axios = require('axios');
const { BASE_URL } = require('./constants')

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

module.exports = instance;
