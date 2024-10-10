const axios = require('axios');
const { obtenerDescarga, guardarArchivo } = require("./obtenerArchivo");

const numeroTelefono = (messages) => {
  let newNumber = '';
  const number = messages['from'];
  if (number.length === 13 && number.startsWith('521')) {
    newNumber = '52' + number.slice(3, 13);
  };
  return newNumber;
};

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

const rutaDescarga = async(messages, telefono, tipo)=>{
  let id;
  let filename;
  if (tipo === 'image'){
    id = messages['image']['id'];
  }else if (tipo === 'document') {
    id = messages['document']['id'];
    filename = messages['document']['filename'];
  }

  //obtener id de imagen y guardarlo
  const descarga = await obtenerDescarga(id);
  const ruta = await guardarArchivo(descarga, telefono, id, tipo);
  console.log('docRuta: ', ruta);
  if (ruta.error) {
    return;
  };
  return {
    ruta,
    filename
  }
}

module.exports = {
  numeroTelefono,
  rutaDescarga,
  fetchApi,
}