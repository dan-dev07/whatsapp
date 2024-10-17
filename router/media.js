/*
  path: api/media
*/

const {Router} = require('express');
const router = Router();
const {check} = require('express-validator');
const {validarCampos} = require('../middlewares/validarCampos');
const validarJWT = require('../helpers/validarJWT');
const { entregarArchivoBuffer, subirArchivo, upload } = require('../controller/media');

router.post('/', [
  check('urlDocumento', 'El enlace es obligatorio').not().isEmpty(),
  check('tipo', 'El tipo de dato es obligatorio').not().isEmpty(),
  validarCampos
],entregarArchivoBuffer);

router.post('/carga', upload.single('file'),subirArchivo);

module.exports = router;