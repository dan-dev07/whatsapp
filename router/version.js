/*
  path: api/Version
*/

const {Router} = require('express');
const router = Router();
const { obtenerVersion } = require('../controller/version');

router.get('/', obtenerVersion);

module.exports = router;