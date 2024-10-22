/*
  path: api/Login
*/

const {Router} = require('express');
const router = Router();
const { crearUsario, ingresar, nuevoToken } = require('../controller/auth');
const {check} = require('express-validator');
const {validarCampos} = require('../middlewares/validarCampos');
const validarJWT = require('../helpers/validarJWT');

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
  check('password', 'La contraseña es obligatorio').not().isEmpty(),
  check('email', 'Necesito un correo válido').isEmail(),
  check('rol', 'Necesito un puesto válido para este usuario').not().isEmpty(),
  validarCampos
] ,ingresar);

router.delete('/Borrar',[
  check('email', 'Necesito un correo válido').isEmail(),
  validarCampos
] ,ingresar);

router.post('/Refresh',
  check('token', 'El token es obligatorio').not().isEmpty(),
  nuevoToken);

module.exports = router;