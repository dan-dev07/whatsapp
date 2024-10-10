/*
  path: api/login
*/

const {Router} = require('express');
const router = Router();
const {check} = require('express-validator');
const {validarCampos} = require('../middlewares/validarCampos');
const validarJWT = require('../helpers/validarJWT');
const { descargarImagen } = require('../controller/media');

router.post('/', [
  check('urlDocumento', 'El enlace es obligatorio').not().isEmpty(),
  check('telefono', 'Datos del usuario son obligatorios').not().isEmpty(),
  check('tipo', 'El tipo de dato es obligatorio').not().isEmpty(),
  validarCampos
],descargarImagen);

module.exports = router;