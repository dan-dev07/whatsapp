/*
  path: api/Usuarios
*/

const {Router} = require('express');
const router = Router();

const { obtenerUsuarios } = require('../controller/usuario');
const { check } = require('express-validator');
const { actualizarUsuario } = require('../controller/auth');
const { validarCampos } = require('../middlewares/validarCampos');

router.get('/', obtenerUsuarios);
router.post('/', [
  check('nombre', 'Necesito un nombre').not().isEmpty(),
  check('password', 'Necesito una contraseña').not().isEmpty(),
  check('email', 'Necesito un correo válido').not().isEmpty(),
  check('rol', 'Necesito almenos un rol para el usuario').not().isEmpty(),
  check('activo', 'Necesito el estado actual del usuario').not().isEmpty(),
  validarCampos
], actualizarUsuario);

module.exports = router;