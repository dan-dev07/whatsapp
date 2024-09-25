const SinAsignar = require('../models/sinAsignar');
const dayjs = require('dayjs');

const obtenerPendientes = async () => {
  try {   
    const mensajes = await SinAsignar.find();
    if (!mensajes) {
      return [];
    }
    return {
      mensajes
    };
    
  } catch (error) {
    console.log(error);
    return {
      response:'No se obtuvieron los datos correctamente'
    };
  }
};

const agregarPendientes = async(mensaje, telefono) => {
  try {    
    const fecha = dayjs().format('DD/MM/YYYY HH:mm a');
    const agregarMensaje = await SinAsignar({telefono, mensaje, fecha});
    agregarMensaje.save();
    console.log('Mensaje enviado');
    return ({
      mensaje: agregarMensaje
    });
  } catch (error) {
    console.log(error)
    return ({
      mensaje: 'No se pudo guardar el mensaje'
    });
  };
};

module.exports = {
  obtenerPendientes,
  agregarPendientes,
}