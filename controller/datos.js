const { response } = require('express');
const Paciente = require('../models/paciente');
const SinAsignar = require('../models/sinAsignar');
const { obtenerPacientesPorUsuario } = require('./paciente');
const { MensajeError } = require('../helpers/error');

const mensajesSinAsignar = async (req, res = response) => {
  try {
    const pendientes = await SinAsignar.find();
    if (!pendientes) {
      return [];
    };
    const ultimoMensajeArray = pendientes.map(m => {
      const { mensajes, telefono, uid, datosPaciente } = m;
      const ultimo = mensajes[mensajes.length - 1];
      return {
        telefono,
        uid,
        fecha: ultimo.fecha,
        emisor: ultimo.emisor,
        tipo: ultimo.tipo,
        mensaje: ultimo.mensaje,
        datosPaciente,
      }
    });
    res.status(200).json({
      mensajes: ultimoMensajeArray
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al obtener todos los mensajes'
    });
  }
};

const allMessages = async (req, res = response) => {
  try {
    const mensajesPacientes = await Paciente.find();
    const pendientes = await SinAsignar.find();
    const arregloPendientes = pendientes.map(m => {
      const { mensajes } = m;
      const ultimo = mensajes[mensajes.length - 1];
      return {
        uid: m.uid,
        telefono: m.telefono,
        fecha: ultimo.fecha,
        datosPaciente: m.datosPaciente,
        usuario: {
          nombre: '',
          // email:'', 
          uid: ''
        }
      }
    });

    const arregloPacientes = mensajesPacientes.map((m) => {
      const { usuarioAsignado, chats } = m;
      const fecha = chats[chats.length - 1].fecha;

      return {
        nombrepaciente: m.nombrePaciente,
        uid: m.uid,
        telefono: m.telefono,
        fecha,
        datosPaciente: m.datosPaciente,
        usuario: {
          nombre: usuarioAsignado.nombre,
          // email:usuarioAsignado.email,
          uid: usuarioAsignado.uid
        },
      };
    });
    const mensajes = [...arregloPendientes, ...arregloPacientes].sort((a, b) => b.fecha.localeCompare(a.fecha));
    // console.log('Enviado');
    res.send(mensajes);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al obtener todos los mensajes'
    });
  };
};

const allMessagesSocket = async () => {
  try {
    const mensajesPacientes = await Paciente.find();
    const pendientes = await SinAsignar.find();
    const arregloPendientes = pendientes.map(m => {
      const { mensajes } = m;
      const ultimo = mensajes[mensajes.length - 1];
      return {
        uid: m.uid,
        telefono: m.telefono,
        fecha: ultimo.fecha,
        datosPaciente: m.datosPaciente,
        usuario: {
          nombre: '',
          // email:'', 
          uid: ''
        }
      }
    });

    const arregloPacientes = mensajesPacientes.map((m) => {
      const { usuarioAsignado, chats } = m;
      const fecha = chats[chats.length - 1].fecha;

      return {
        nombrepaciente: m.nombrePaciente,
        uid: m.uid,
        telefono: m.telefono,
        fecha,
        datosPaciente: m.datosPaciente,
        usuario: {
          nombre: usuarioAsignado.nombre,
          // email:usuarioAsignado.email,
          uid: usuarioAsignado.uid
        },
      };
    });
    const mensajes = [...arregloPendientes, ...arregloPacientes].sort((a, b) => b.fecha.localeCompare(a.fecha));
    // console.log('Enviado');
    return mensajes;
  } catch (error) {
    console.log(error);
    return MensajeError('Hubo un error al obtener todos los mensajes', error);
  };
};

const getChat = async (req, res = response) => {
  try {
    const { telefono, uid } = req.body;
    const pacienteActual = await Paciente.findOne({ telefono, 'usuarioAsignado.uid': uid });
    const { chats } = pacienteActual;
    const mensajesLeidos = chats.map(c => {
      if (c.emisor === 'Paciente') {
        c.leido = true;
      };
      return c;
    });
    const pacienteActualizado = await Paciente.findOneAndUpdate({ telefono, 'usuarioAsignado.uid': uid }, { chats: mensajesLeidos }, { new: true });
    const { chats: chatsAct, datosPaciente } = pacienteActualizado;
    req.io.to(uid).emit('mis-mensajes', await obtenerPacientesPorUsuario(uid));
    res.send({ chatsAct, datosPaciente });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'No se pudo cargar la conversación'
    });
  };
};

//Paginación
const getChatPaginacion = async (req, res = response) => {
  try {
    const {telefono, uid, pagina, limite = 10} = req.body;
    const pacienteActual = await Paciente.findOne({telefono, 'usuarioAsignado.uid': uid});
    const {chats} = pacienteActual;
    const mensajesLeidos = chats.map(c=> {
      if (c.emisor === 'Paciente') {
        c.leido = true;
      };
      return c;
    });
    const startIndex = (pagina - 1) * limite;
    const endIndex = page * limite;
    const mensajesPorPagina = mensajesLeidos.slice(startIndex, endIndex);
    //Calcular el total de páginas
    const mensajesTotales = mensajesLeidos.length;
    const paginasTotales = Math.ceil(mensajesTotales / limite);

    //Enviar mensajes paginados
    res.status(200).json({
      mensajesPorPagina,
      mensajesTotales,
      pagina,
      paginasTotales
    })

  } catch (error) {
    
  }
}

const agregarDatosContactoPaciente = async (req, res = response) => {
  try {
    const { nombre, apellido, empresa, telefono, uid } = req.body;

    const pacienteActualizado = await Paciente.findOneAndUpdate({ telefono, 'usuarioAsignado.uid': uid }, {
      datosPaciente: {
        nombre,
        apellido,
        empresa,
      }
    }, { new: true });
    const { datosPaciente } = pacienteActualizado;
    req.io.to(uid).emit('mis-mensajes', await obtenerPacientesPorUsuario(uid));
    res.send(datosPaciente);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'No se pudo cargar la conversación'
    });
  };
};

module.exports = {
  agregarDatosContactoPaciente,
  allMessages,
  allMessagesSocket,
  mensajesSinAsignar,
  getChat,
}