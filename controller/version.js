const express = require('express');

const obtenerVersion = async (req, res = express.response) => {
  try {
    const appVersion = 0.1;
    const appEnv = 'Prod';
    res.json({
      version: appVersion,
      env: appEnv,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al enviar los datos'
    });
  };
};

module.exports = {
  obtenerVersion,
}