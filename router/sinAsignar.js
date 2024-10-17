/*
  path:api/sinAsignar
*/

const {Router} = require('express');
const validarJWT = require('../helpers/validarJWT');
const {check} = require('express-validator');
const { agregarPendientes, obtenerPendientes } = require('../controllers/sinAsignar');

const router = Router();

router.post('/agregar',[
  check('telefono', 'El telefono es obligatorio').not().isEmpty(),
  check('mensaje', 'El mensaje es obligatorio').not().isEmpty(),
],agregarPendientes );

module.exports = router;