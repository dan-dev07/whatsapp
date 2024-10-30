/*
  path: api/datos
*/

const {Router} = require('express');
const { allMessages, getChat } = require('../controller/datos');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const router = Router();

router.get('/allMessages', allMessages);
router.post('/getChat',[
  check('telefono', 'Necesito un telefono').not().isEmpty(),
  check('uid', 'Necesito un identificador válido').not().isEmpty(),
  validarCampos
], getChat);

module.exports = router;