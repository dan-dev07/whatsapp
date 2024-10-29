const { response } = require('express');
const Paciente = require('../models/paciente');
const SinAsignar = require('../models/sinAsignar');

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
        usuario:{
          nombre:'', 
          email:'', 
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
        usuario: {
          nombre:usuarioAsignado.nombre,
          email:usuarioAsignado.email,
          uid:usuarioAsignado.uid
        }
      }
    });
    const mensajes = [...arregloPendientes, ...arregloPacientes];
    res.send(mensajes);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al obtener todos los mensajes'
    });
  };
};


module.exports = {
  allMessages,
}