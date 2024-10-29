const express = require('express');
const Usuario = require('../models/usuario');

const obtenerUsuarios = async (req, res = express.response) => {
  try {
    const users = await Usuario.find();
    const usuarios = users.map(u => {
      const { email, nombre, rol, uid, activo } = u;
      return { email, nombre, rol, uid, activo };
    })
    res.send(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al guardar los datos'
    });
  };
};

const actulizarEstado = async (uid, activo) => {
  try {
    const act = await Usuario.findOneAndUpdate({ uid }, {activo}, {new:true});

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