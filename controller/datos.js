const { response } = require('express');
const Paciente = require('../models/paciente');

const allMessages = async (req, res = response) => {
  try {
    const mensajesPacientes = await Paciente.find();  
    const arreglo = mensajesPacientes.map((m)=>{
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
    });
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