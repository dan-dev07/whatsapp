const { MensajeError } = require('../helpers/error');
const SinAsignar = require('../models/sinAsignar');
const dayjs = require('dayjs');

const obtenerPendientes = async () => {
  try {
    const pendientes = await SinAsignar.find();
    // console.log('obtenerPendientes: ', mensajes)
    if (!pendientes) {
      return [];
    };
    const ultimoMensajeArray = pendientes.map(m => {
      const { mensajes, telefono } = m;
      const ultimo = mensajes[mensajes.length - 1];
      return {
        telefono,
        mensaje: ultimo.mensaje,
        fecha: ultimo.fecha,
        id: ultimo.id,
        emisor: ultimo.emisor,
        tipo: ultimo.tipo,
        idArchivo: ultimo.idArchivo,
      }
    });
    return {
      mensajes: ultimoMensajeArray
    };

  } catch (error) {
    console.log(error);
    return {
      err: 'No se obtuvieron los datos correctamente'
    };
  }
};

//para un mensaje de texto 
const agregarPendientesTexto = async (mensaje, telefono, tipo) => {
  try {
    // buscar en pendientes y actualizar
    const mensajePaciente = await SinAsignar.findOne({ telefono });
    const emisor = 'Paciente';
    const fecha = dayjs().format('DD/MM/YYYY HH:mm a');
    const mensajes = { fecha, emisor, tipo, mensaje };
    if (!mensajePaciente) {
      //guardar mensaje
      const agregarMensaje = await SinAsignar.create({ telefono, mensajes });
      console.log('Pendiente guardado: ', agregarMensaje);
      return true;
    }
    const res = await SinAsignar.findOneAndUpdate({ telefono },
      { $push: { mensajes } },
      { new: true }
    );
    console.log(mensajes);
    console.log('Pendiente actualizado');
    return true;
  } catch (error) {
    console.log(error);
    return {
      err: 'No se guardó el mensaje'
    }
  };
};

//para recibir una imagen
const agregarPendientesImagen = async (telefono, tipo, urlDocumento) => {
  try {
    // buscar en pendientes y actualizar
    const mensajePaciente = await SinAsignar.findOne({ telefono });
    const emisor = 'Paciente';
    const fecha = dayjs().format('DD/MM/YYYY HH:mm a');
    const mensajes = { fecha, emisor, tipo, urlDocumento ,mensaje:'Imagen recibido'};
    if (!mensajePaciente) {
      //guardar mensaje
      const agregarMensaje = await SinAsignar.create({ telefono, mensajes });
      console.log('Pendiente guardado: ', agregarMensaje);
      return true;
    }
    const res = await SinAsignar.findOneAndUpdate({ telefono },
      { $push: { mensajes } },
      { new: true }
    );
    console.log('Pendiente actualizado');
    return true;
  } catch (error) {
    console.log(error);
    return MensajeError('No se guardó el mensaje', error);
  };
};

//para recibir un archivo pdf
const agregarPendientesPdf = async (telefono, tipo, urlDocumento, filename) => {
  try {
    // buscar en pendientes y actualizar
    const mensajePaciente = await SinAsignar.findOne({ telefono });
    const emisor = 'Paciente';
    const fecha = dayjs().format('DD/MM/YYYY HH:mm a');
    const mensajes = { fecha, emisor, tipo, urlDocumento, filename, mensaje:'Pdf recibido'};
    if (!mensajePaciente) {
      //guardar mensaje
      const agregarMensaje = await SinAsignar.create({ telefono, mensajes });
      console.log('Pendiente guardado: ', agregarMensaje);
      return true;
    }
    const res = await SinAsignar.findOneAndUpdate({ telefono },
      { $push: { mensajes } },
      { new: true }
    );
    console.log(mensajes);
    console.log('Pendiente actualizado');
    return true;
  } catch (error) {
    console.log(error);
    return MensajeError('No se guardó el mensaje', error);
  };
};

const guardarImagenPendiente =()=>{

};

module.exports = {
  obtenerPendientes,
  agregarPendientesTexto,
  agregarPendientesImagen,
  agregarPendientesPdf,
  guardarImagenPendiente,
};