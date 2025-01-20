/*
  path: api/datos
*/

const {Router} = require('express');
const { allMessages, getChat, agregarDatosContactoPaciente } = require('../controller/datos');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { validarDatoNoNulo } = require('../helpers/funciones');
const router = Router();

router.get('/allMessages', allMessages);

router.post('/getChat',[
  check('telefono', 'Necesito un telefono').not().isEmpty(),
  check('uid', 'Necesito un identificador válido').not().isEmpty(),
  validarCampos
], getChat);

router.post('/actualizarPaciente', [
  check('nombre', 'Necesito un Nombre de contacto').not().isEmpty(),
  check('apellido').custom(validarDatoNoNulo),
  check('empresa').custom(validarDatoNoNulo),
  check('telefono', 'Necesito un telefono').not().isEmpty(),
  check('uid', 'Necesito un identificador válido').not().isEmpty(),
], agregarDatosContactoPaciente);

module.exports = router;