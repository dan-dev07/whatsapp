const express = require('express');
const Usuario = require('../models/usuario');

const obtenerUsuarios = async (req, res = express.response)=>{
  try {
    const users = await Usuario.find({}, 'nombre email rol');
    const usuarios = users.map(u=>{
      const {email, nombre, rol, id} = u;
      return {email, nombre, rol, id}
    })
    res.send(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al guardar los datos'
    });
  }
}

module.exports = {
  obtenerUsuarios,
}