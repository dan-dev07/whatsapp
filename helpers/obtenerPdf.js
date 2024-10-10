const axios = require('axios');
const fs = require('fs');
const path = require('path');
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

const obtenerUrlPdf = async (id) => {
  //se envia el id para conseguir el enlace desde fb
  const url1 = `https://graph.facebook.com/v20.0/${id}`;
  const respuestaUrl = await fetchApi(url1);
  const { url } = respuestaUrl.data;

  //con el enlace, tenemos listo el doc pdf para su descarga
  const url2 = url;
  const resPdf = await fetchApi(url2, 'stream');
  return resPdf;
}

async function obtenerPdf(outputPath, res) {
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
    return MensajeError('Error al escribir el pdf en el buffer local', error);
    
  };
};

const guardarPdf = async (res, id) => {
  let ok = false;
  //guardar los datos en un stream buffer para su manejo
  const outputPath = path.join(__dirname, 'pdf', `${id}.pdf`); // Ruta local donde se guardará el archivo pdf
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  const resp = await obtenerPdf(outputPath, res)
  if (resp === true) {
    ok = true;
    console.log('PDF descargado y guardado con éxito.');
  } else {
    ok = false;
  };
  return ok;
}

module.exports = {
  obtenerPdf,
  obtenerUrlPdf,
  guardarPdf,
}