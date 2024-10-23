const { MensajeError } = require('../helpers/error');
const SinAsignar = require('../models/sinAsignar');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const mexicoCityTime = dayjs.tz('America/Mexico_City');

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

const agregarPendiente = async (mensaje, telefono, tipo, urlDocumento, filename, emisor='Paciente')=>{
  try {
    const fecha = mexicoCityTime.format('DD/MM/YYYY HH:mm a');
    const mensajes = { fecha, emisor, tipo, urlDocumento, filename, mensaje};
    // buscar en pendientes y actualizar
    const mensajePaciente = await SinAsignar.findOne({ telefono });
    if (!mensajePaciente) {
      //guardar mensaje
      const agregarMensaje = await SinAsignar.create({ telefono, mensajes });
      return {ok:true};
    };
    const res = await SinAsignar.findOneAndUpdate({ telefono },
      { $push: { mensajes } },
      { new: true }
    );
    console.log('Pendiente actualizado');

    return {ok:true};
  } catch (error) {
    console.log(error);
    return {
      err: 'No se guardó el mensaje'
    };
  };
};

const agregarDesdePaciente =async (paciente)=>{
  try {
    const {chats, telefono} = paciente;
    const nuevoPendiente = await SinAsignar({telefono, mensajes:chats});
    nuevoPendiente.save();
    console.log('Paciente reasignado a Pendientes');
    if (!nuevoPendiente) {
      return {ok:false};
    };
    return {ok:true};
  } catch (error) {
    console.log(error);
    return {
      err: 'No se pudo reasignar al paciente'
    };
  };
};

module.exports = {
  obtenerPendientes,
  agregarPendiente,
  agregarDesdePaciente,
};