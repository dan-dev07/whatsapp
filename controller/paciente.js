const Paciente = require('../models/paciente');
const SinAsignar = require('../models/sinAsignar');
const Usuario = require('../models/usuario');
const { newFecha } = require('../helpers/funciones');

const agregarPaciente = async (datos) => {
  try {
    const { nombrePaciente = 'Pruebas', telefono, nombre, email, userUid, pacienteUid, ultimaComunicacion } = datos;
    const user = { nombre, email, uid:userUid };
    const pendiente = await SinAsignar.findOne({ telefono, uid:pacienteUid });
    const chats = pendiente.mensajes;
    const paciente = await Paciente({ nombrePaciente, telefono, uid:pacienteUid, usuarioAsignado: user, ultimaComunicacion, chats: chats });
    paciente.save();
    await SinAsignar.findOneAndDelete({ telefono });
    console.log('Paciente agregado');
    return ({
      paciente
    });
  } catch (error) {
    console.log(error)
    return { err: 'No se pudo guardar el paciente' };
  };
};

const obtenerPacientesPorUsuario = async (uid) => {
  try {
    const pacientesPorUsuario = (await Paciente.find({ 'usuarioAsignado.uid': uid })).map(p => {
      const { nombrePaciente, telefono, chats, uid } = p;
      const ultimoMsg = chats[chats.length - 1];  
      const { fecha, mensaje, leido, tipo } = ultimoMsg;
      return { nombrePaciente, telefono, uid, fecha, mensaje, leido, tipo };
    });
    return pacientesPorUsuario.sort((a, b) => a.leido - b.leido);
  } catch (error) {
    console.log(error)
    return { err: 'No se pudo obtener a los pacientes para el usuario' }
  };
};

const guardarMensajeEnviado = async (telefono, email, mensaje) => {
  try {
    const paciente = await Paciente.findOneAndUpdate(
      { telefono, 'usuarioAsignado.email': email },
      { $push: { chats: mensaje } },
      { new: true });
    const ultimo = paciente.chats[paciente.chats.length - 1];
    return ultimo;
  } catch (error) {
    console.log(error);
    return { err: 'No se pudo obtener guardar el mensaje' };
  };
};

const guardarArchivoEnviado = async (telefono, email, urlDocumento, tipo, filename) => {
  try {
    const fecha = newFecha();
    const mensaje = {
      fecha,
      emisor: 'Escotel',
      tipo,
      filename,
      urlDocumento,
      mensaje: tipo==='image'?"Imagen enviado":"Documento enviado",
      leido: false,
    }
    const paciente = await Paciente.findOneAndUpdate(
      { telefono, 'usuarioAsignado.email': email },
      { $push: { chats: mensaje } },
      { new: true });
    const ultimo = paciente.chats[paciente.chats.length - 1];
    return ultimo;
  } catch (error) {
    console.log(error);
    return { err: 'No se pudo obtener guardar el mensaje' };
  };
}


const obtenerConversacionActual = async (telefono, email) => {
  try {
    const pacienteActual = await Paciente.findOne({ telefono, 'usuarioAsignado.email': email });

    const { chats } = pacienteActual;
    const mensajesLeidos = chats.map(c => {
      if (c.emisor === 'Paciente') {
        c.leido = true;
      };
      return c;
    });
    const pacienteActualizado = await Paciente.findOneAndUpdate({ telefono, 'usuarioAsignado.email': email }, { chats: mensajesLeidos }, { new: true });
    const { chats: chatsAct } = pacienteActualizado;

    return chatsAct;
  } catch (error) {
    console.log(error);
    return { err: 'No se pudo cargar las conversaciones' };
  }
}

const buscarNumeroExistente = async (telefono) => {
  try {
    const numeroExistente = await Paciente.findOne({ telefono });
    // console.log('numeroExistente: ', numeroExistente);
    if (!numeroExistente) {
      return {
        ok: false,
      };
    };
    return {
      ok: true,
      usuarioAsignado: numeroExistente.usuarioAsignado,
    };
  } catch (error) {
    console.log(error);
    return { err: 'Error al encontrar el numero en pendientes y en pacientes' };
  }
};

const quitarUsuario = async (telefono, uid) => {
  try {
    const pacienteActual = await Paciente.findOneAndDelete({ telefono, uid }, { new: true });
    if (!pacienteActual) {
      return { ok: false }
    }
    return { ok: true, paciente: pacienteActual };
  } catch (error) {
    console.log(error);
    return { err: 'Error al eliminar un usuario de un paciente' };
  };
};

const reasignarPaciente = async (telefono, nuevoUsuario, anteriorUsuario, pacienteUid) => {
  try {
    if (!anteriorUsuario) {
      const usuario = await Usuario.findOne({ uid: nuevoUsuario.uid });
      if (!usuario) {
        return { ok: false };
      }
      const { nombre, email} = usuario;
      const nuevoPaciente = await agregarPaciente({ telefono, nombre, email, userUid:usuario.uid, pacienteUid, ultimaComunicacion: '' }, {new:true});
      if (!nuevoPaciente) {
        return { ok: false };  
      }
      return { ok: true };
    }

    const pacienteActualizado = await Paciente.findOneAndUpdate({ telefono, 'usuarioAsignado.uid': anteriorUsuario.uid }, { usuarioAsignado: nuevoUsuario }, { new: true });
    if (!pacienteActualizado) {
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.log(error);
    return { err: 'Error al reasignar al paciente' };
  }
}

module.exports = {
  agregarPaciente,
  obtenerPacientesPorUsuario,
  guardarMensajeEnviado,
  guardarArchivoEnviado,
  obtenerConversacionActual,
  buscarNumeroExistente,
  quitarUsuario,
  reasignarPaciente,
}