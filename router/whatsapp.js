const express = require('express');
const router = express.Router();
const whatsAppController = require('../controllers/whatsapp');

router.get('/', whatsAppController.VerifyToken);
router.post('/', whatsAppController.MensajeRecibido);

module.exports = router;