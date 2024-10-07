const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { MensajeError } = require('./error');

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

const obtenerUrlImagen = async (id) => {
  //se envia el id para conseguir el enlace desde fb
  const url1 = `https://graph.facebook.com/v20.0/${id}`;
  const respuestaUrl = await fetchApi(url1);
  const { url } = respuestaUrl.data;

  //con el enlace, tenemos listo la imagen para su descarga
  const url2 = url;
  const resImagen = await fetchApi(url2, 'stream');
  return resImagen;
};

const obtenerImagen = async (outputPath, res) => {
  try {
    // Crear un stream de escritura para guardar la imagen
    const writer = fs.createWriteStream(outputPath);

    // Pipe el stream de respuesta al stream de escritura
    res.data.pipe(writer);

    // Devuelve una promesa que se resuelve cuando el archivo se ha escrito completamente
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    return true;
  } catch (error) {
    MensajeError('Error al escribir imagen en el buffer local', error);
    return false;
  };
};

const guardarImagen = async (res, id) => {
  let ok = false;
  //guardar los datos en un stream buffer para su manejo
  const outputPath = path.join(__dirname, 'imagenes', `${id}.jpg`); // Ruta local donde se guardará la imagen
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  const resp = await obtenerImagen(outputPath, res);
  if (resp) {
    ok = true;
    console.log('Imagen descargada y guardada con éxito.');
  } else {
    ok = false;
    MensajeError('Error al guardar imagen', {});
  };
  return ok;
};

module.exports = {
  obtenerImagen,
  obtenerUrlImagen,
  guardarImagen,
}