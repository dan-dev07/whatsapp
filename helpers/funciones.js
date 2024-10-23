const { obtenerDescarga, guardarArchivo } = require('./manejoArchivosPacientes/obtenerArchivo');

const numeroTelefono = (messages) => {
  let newNumber = '';
  const number = messages['from'];
  if (number.length === 13 && number.startsWith('521')) {
    newNumber = '52' + number.slice(3, 13);
  };
  return newNumber;
};

const rutaDescargaArchivoRecibido = async(messages, telefono, tipo)=>{
  let id;
  let filename;
  if (tipo === 'image'){
    id = messages['image']['id'];
  }else if (tipo === 'document') {
    id = messages['document']['id'];
    filename = messages['document']['filename'];
  };

  //obtener id de imagen y guardarlo
  try {
    const descarga = await obtenerDescarga(id);
    const ruta = await guardarArchivo(descarga, telefono, id, tipo, filename);
    if (ruta.error) {
      return ruta.msg;
    };
    return {
      ruta,
      filename,
      id
    };
    
  } catch (error) {
    console.log('Error en descargar y guardar el archivo entrante de whatsapp', error);
  }
};

module.exports = {
  numeroTelefono,
  rutaDescargaArchivoRecibido,
}