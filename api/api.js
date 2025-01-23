const axios = require('axios');
require('dotenv').config();

const fetchApi = (url, responseType) => {
  try {
    const instance = axios({
      method: 'GET',
      url,
      responseType,
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
      }
    });
    return instance;
  } catch (err) {
    MensajeError(`${baseURL} --- ${err}`, err);
  };
};

module.exports ={
  fetchApi,
}