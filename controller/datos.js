const { response } = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const { generarJWT, comprobarJWT } = require('../helpers/jwt');
const Paciente = require('../models/paciente');

const allMessages = async (req, res = response) => {
  try {
    const mensajes = await Paciente.find();
    console.log(mensajes);

    const arreglo = mensajes.map((m)=>{
      const {nombrepaciente, telefono, usuarioAsignado:{nombre, email, id}, chats} = m;
      const fecha = chats[ chats.length - 1 ].fecha;

      return {
        nombrepaciente,
        telefono, 
        fecha,
        usuario:{
          nombre, 
          email, 
          id}
      }
    })
    console.log(arreglo);
    res.send(arreglo);
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