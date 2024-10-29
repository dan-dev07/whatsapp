/*
  path: api/Login
*/

const {Router} = require('express');
const router = Router();
const { crearUsario, ingresar, nuevoToken, actualizarUsuario } = require('../controller/auth');
const {check} = require('express-validator');
const {validarCampos} = require('../middlewares/validarCampos');
const { validarPassword } = require('../helpers/funciones');

router.post('/Agregar', [
  check('nombre', 'El usuario es obligatorio').not().isEmpty(),
  check('password', 'La contraseña es obligatorio').not().isEmpty(),
  check('email', 'Necesito un correo válido').isEmail(),
  check('rol', 'Necesito un puesto válido para este usuario').not().isEmpty(),
  validarCampos
],crearUsario);

router.post('/',[
  check('email', 'El correo es obligatorio').isEmail(),
  check('password', 'La contraseña es obligatorio').not().isEmpty(),
  validarCampos
] ,ingresar);

router.post('/Actualizar',[
  check('nombre', 'El usuario es obligatorio').not().isEmpty(),
  check('password').custom(validarPassword),
  check('email', 'Necesito un correo válido').isEmail(),
  check('rol', 'Necesito un puesto válido para este usuario').not().isEmpty().isArray({min:1, max:3}),
  check('activo', 'Necesito un puesto válido para este usuario').not().isEmpty().isBoolean(),
  check('uid', 'Necesito un puesto válido para este usuario').not().isEmpty(),
  validarCampos
],actualizarUsuario);

router.post('/Refresh',
  check('token', 'El token es obligatorio').not().isEmpty(),
  nuevoToken);

module.exports = router;