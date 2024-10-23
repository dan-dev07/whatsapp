const { cargarArchivo } = require('./azureDb');
const { fetchApi } = require('../../api/api');

const obtenerDescarga = async (id)=>{
  try {
    const url1 = `https://graph.facebook.com/v20.0/${id}`;
    const respuestaUrl = await fetchApi(url1);
    const { url } = respuestaUrl.data;
  
    //con el enlace, tenemos listo la imagen para su descarga
    const url2 = url;
    const descarga = await fetchApi(url2, 'arraybuffer');
    return new Buffer.from( descarga.data, 'binary' );
  } catch (error) {
    console.log('No se pudo obtener el enlace de descarga o la descarga',error);
  }
};

const guardarArchivo = async (descarga,telefono, id, tipo, filename) => {
  try {
    const respGuardado = await cargarArchivo(descarga, telefono, id, tipo, filename);
    return respGuardado;
  } catch (error) {
    console.log('No se pudo obtener el enlace de descarga o la descarga',error);
  };
};

module.exports = {
  obtenerDescarga,
  guardarArchivo,
}