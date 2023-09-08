const BASE_URL = process.env.NODE_ENV === 'production' ? '/' : process.env.GENDATA_DEV_BASE_URL;

module.exports = { BASE_URL };
