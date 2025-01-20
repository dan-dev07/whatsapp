const { response } = require('express');
const Paciente = require('../models/paciente');
const SinAsignar = require('../models/sinAsignar');
const { obtenerPacientesPorUsuario } = require('./paciente');

const allMessages = async (req, res = response) => {
  try {
    const mensajesPacientes = await Paciente.find();
    const pendientes = await SinAsignar.find();
    const arregloPendientes = pendientes.map(m => {
      const { mensajes } = m;
      const ultimo = mensajes[mensajes.length - 1];
      return {
        uid:m.uid,
        telefono:m.telefono,
        fecha: ultimo.fecha,
        datosPaciente:m.datosPaciente,
        usuario:{
          nombre:'', 
          // email:'', 
          uid:''
        }
      }
    });

    const arregloPacientes = mensajesPacientes.map((m) => {
      const { usuarioAsignado, chats } = m;
      const fecha = chats[chats.length - 1].fecha;

      return {
        nombrepaciente:m.nombrePaciente,
        uid: m.uid,
        telefono: m.telefono,
        fecha,
        datosPaciente: m.datosPaciente,
        usuario: {
          nombre:usuarioAsignado.nombre,
          // email:usuarioAsignado.email,
          uid:usuarioAsignado.uid
        },
      };
    });
    const mensajes = [...arregloPendientes, ...arregloPacientes];
    // console.log('Enviado');
    res.send(mensajes);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al obtener todos los mensajes'
    });
  };
};

const getChat = async (req, res = response)=>{
  try {
    const {telefono, uid} = req.body;
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
    res.send( {chatsAct,datosPaciente} );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'No se pudo cargar la conversación'
    });
  };
};

const agregarDatosContactoPaciente = async (req, res = response)=>{
  try {
    const {nombre, apellido, empresa, telefono, uid} = req.body;

    const pacienteActualizado = await Paciente.findOneAndUpdate({ telefono, 'usuarioAsignado.uid': uid }, {datosPaciente:{
      nombre, 
      apellido,
      empresa,
    }}, { new: true });
    req.io.to(uid).emit('mis-mensajes', await obtenerPacientesPorUsuario(uid));
    res.send( pacienteActualizado );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'No se pudo cargar la conversación'
    });
  }
}

module.exports = {
  agregarDatosContactoPaciente,
  allMessages,
  getChat,
}