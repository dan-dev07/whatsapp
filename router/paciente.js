/*
  path: api/pacientes
*/

const {Router} = require('express');
const {check} = require('express-validator');
const { agregarPaciente } = require('../controllers/paciente');

const router = Router();

router.post('/agregar', [
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('telefono', 'El telefono es obligatorio').not().isEmpty(),
  check('usuarioAsignado', 'El usuario es obligatorio').not().isEmpty(),
  check('ultimaComunicacion', 'La fecha es obligatorio').not().isEmpty(),
  check('chats', 'El chat es obligatorio').not().isEmpty(),
],agregarPaciente)

module.exports = router;