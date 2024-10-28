const express = require('express');
const Usuario = require('../models/usuario');

const obtenerUsuarios = async (req, res = express.response) => {
  try {
    const users = await Usuario.find();
    const usuarios = users.map(u => {
      const { email, nombre, rol, id, activo } = u;
      return { email, nombre, rol, id, activo };
    })
    res.send(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al guardar los datos'
    });
  };
};

const actulizarEstado = async (email, activo) => {
  try {
    const act = await Usuario.findOneAndUpdate({ email }, {activo}, {new:true});

    return {ok:true,activo:act.activo};
  } catch (error) {
    console.log(error);
    return {
      err:'No se pudo actualizar el estado del usuario'
    };
  };
};


module.exports = {
  obtenerUsuarios,
  actulizarEstado,
}