const { uploadBlobImagen, uploadBlobPdf } = require("./cargarArchivo");
const { downloadBlobImagen } = require("./descargarArchivo");
const { obtenerUrlImagen, guardarImagen } = require("./obtenerImagen");
const { obtenerUrlPdf, guardarPdf } = require("./obtenerPdf");

const numeroTelefono = (messages) => {
  let newNumber = '';
  const number = messages['from'];
  if (number.length === 13 && number.startsWith('521')) {
    newNumber = '52' + number.slice(3, 13);
  };
  return newNumber;
};

const idImagen = (messages) => {
  const idArchivo = messages['image']['id'];
  const mimeType = messages['image']['mime_type'];
  return {
    idArchivo,
    mimeType
  };
};

const idPdf = (messages) => {
  const idArchivo = messages['document']['id'];
  const mimeType = messages['document']['mime_type'];
  const filename = messages['document']['filename'];
  return {
    idArchivo,
    mimeType,
    filename,
  };
};

const rutaImagen = async (messages, telefono)=>{
  const id = messages['image']['id'];
  //obtener id de imagen y guardarlo
  const resImagen = await obtenerUrlImagen(id);
  const docRespuesta = await guardarImagen(resImagen, id);
  console.log(docRespuesta);
  if (docRespuesta !== true) {
    return;
  };

  const ruta = await uploadBlobImagen(id, telefono);
  console.log(ruta);
  return ruta;
};

const rutaPdf = async (messages, telefono)=>{
  const id = messages['document']['id'];
  const filename = messages['document']['filename'];
  //obtener id de imagen y guardarlo
  const resImagen = await obtenerUrlPdf(id);
  const docRespuesta = await guardarPdf(resImagen, id);
  if (docRespuesta !== true) {
    return ;
  };

  const ruta = await uploadBlobPdf(id, telefono);
  console.log(ruta);
  return {
    ruta,
    filename,
  };
}



module.exports = {
  numeroTelefono,
  idImagen,
  idPdf,
  rutaImagen,
  rutaPdf,
}