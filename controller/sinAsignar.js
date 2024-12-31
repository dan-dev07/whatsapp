const { v4: uuidv4 } = require('uuid');
const { newFecha } = require('../helpers/funciones');
const SinAsignar = require('../models/sinAsignar');

const obtenerPendientes = async () => {
  try {
    const pendientes = await SinAsignar.find();
    // console.log('obtenerPendientes: ', mensajes)
    if (!pendientes) {
      return [];
    };
    const ultimoMensajeArray = pendientes.map(m => {
      const { mensajes, telefono, uid} = m;
      const ultimo = mensajes[mensajes.length - 1];
      return {
        telefono,
        uid,
        fecha: ultimo.fecha,
        emisor: ultimo.emisor,
        tipo: ultimo.tipo,
        mensaje: ultimo.mensaje,
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

const agregarPendiente = async (id, mensaje, telefono, tipo, urlDocumento, filename, emisor='Paciente')=>{
  try {
    const fecha = newFecha();
    const uid = uuidv4();
    const mensajes = { fecha, emisor, tipo, urlDocumento, filename, mensaje, mensajeId:id};
    // buscar en pendientes y actualizar
    const mensajePaciente = await SinAsignar.findOne({ telefono });
    if (!mensajePaciente) {
      //guardar mensaje
      const agregarMensaje = await SinAsignar.create({ telefono, uid, mensajes });
      return {ok:true};
    };
    const res = await SinAsignar.findOneAndUpdate({ telefono },
      { $push: { mensajes } },
      { new: true }
    );
    // console.log('Pendiente actualizado');

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
    const {chats, telefono, uid} = paciente;
    const nuevoPendiente = await SinAsignar({telefono, uid, mensajes:chats});
    nuevoPendiente.save();
    // console.log('Paciente reasignado a Pendientes');
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