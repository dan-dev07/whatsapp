/*
  path: api/datos
*/

const {Router} = require('express');
const { allMessages } = require('../controller/datos');
const router = Router();

router.get('/allMessages', allMessages);

module.exports = router;