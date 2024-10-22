/*
  path: api/Usuarios
*/

const {Router} = require('express');
const router = Router();

const { obtenerUsuarios } = require('../controller/usuario');

router.get('/', obtenerUsuarios);

module.exports = router;