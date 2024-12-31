const { response } = require('express');
const axios = require('axios');
const https = require('https');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();
const fs = require('fs');
const Paciente = require('../models/paciente');
const { MensajeError } = require('../helpers/error');
const { urlMeta } = require('../cons/urls');
const { optionsMessage } = require('../cons/optionsMessage');
const { numeroTelefono, rutaDescargaArchivoRecibido, newFecha, mostrarDatosEntradaWhatsapp } = require('../helpers/funciones');
const { buscarNumeroExistente, obtenerPacientesPorUsuario } = require('./paciente');
const { agregarPendiente, obtenerPendientes } = require('./sinAsignar');
const { SampleText } = require('../helpers/textTypes');
const { typeMessages } = require('../cons/typeMessages');

const processMessage = async (req, messages, additionalData = {}) => {
  const { type, from: number, id } = messages;
  const messageContent = type === 'text' ? messages['text']['body'] : typeMessages[type];
  const resExistente = await buscarNumeroExistente(number);
  if (resExistente.ok === false) {
    const respPendientes = await agregarPendiente(id, messageContent, number, type, ...Object.values(additionalData));
    if (!respPendientes.err) {
      req.io.emit('mensajes-sinAsignar', await obtenerPendientes());
    };
  } else if (resExistente.ok) {
    const mensaje = await GuardarMensajeRecibido(id, messageContent, number, type, ...Object.values(additionalData));
    const { ultimoMsg, uid } = mensaje;
    req.io.to(uid).emit('mensaje-recibido', { ultimo: ultimoMsg, telefono: number });
    req.io.to(uid).emit('mis-mensajes', await obtenerPacientesPorUsuario(resExistente.usuarioAsignado.uid));
  };
};

const Whatsapp = async (req, res = response) => {
  mostrarDatosEntradaWhatsapp(req.body);
  try {
    const entry = req.body['entry'][0];
    const changes = entry['changes'][0];
    const value = changes['value'];
    const messageObject = value['messages'];

    if (messageObject) {
      const type = messageObject[0]['type'];
      const messages = messageObject[0];

      // Lógica común para procesar mensajes
      if (type === 'text') {
        await processMessage(req, messages);
      } else {
        const { ruta, filename } = await rutaDescargaArchivoRecibido(messages);
        await processMessage(req, messages, { ruta, filename });
      };
    };
    res.send('EVENT_RECEIVED');
  } catch (error) {
    console.log(error);
    res.send('EVENT_RECEIVED');
  };
};

const VerifyToken = (req, res = response) => {
  try {
    const accessToken = process.env.ACCESS_TOKEN_WHATSAPP;
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (challenge !== null && token !== null && token == accessToken) {
      res.send(challenge);
    } else {
      res.status(400).send();
    };
  } catch (error) {
    res.status(400).send();
  };
};

const SendMessageWhatsApp = async (textResponse, number) => {
  const data = SampleText(number, textResponse);
  const options = optionsMessage(data);

  return new Promise ((resolve, reject)=>{
    let responseData = '';
    const req = https.request(options, res=>{
      res.on('data', d=>{
        process.stdout.write(d);
        responseData += d;
      });
      res.on('end', ()=>{
        try {
          const jsonResponse = JSON.parse(responseData);
          const messageId = jsonResponse.messages && jsonResponse.messages[0] ? jsonResponse.messages[0].id : null;
          resolve(messageId);
        } catch (error) {
          console.log(error);
          reject('Error al convertir los datos a JSON desde facebook.com');
        };
      });
    });
    req.on('error', error => {
      reject('Error de solicitud: ' + error);
    });
    req.write(data);
    req.end();
  });
  
};

const SendFileWhatsApp = async (data) => {
  try {
    //guardar información para el envio de datos a facebook
    const options = optionsMessage(data);

    //enviar datos a facebook para reenviar mensaje al numero de teléfono
    const req = https.request(options, res => {
      res.on('data', d => {
        process.stdout.write(d);
      });
    });
    req.on('error', error => {
      console.error('error: ', error);
    });
    req.write(data);
    req.end();
  } catch (error) {
    console.log(error);
    return MensajeError('No se pudo enviar el documento', error);
  };
}

const SetFileWhatsApp = async (filename, mimetype, telefono, pathFile) => {
  const ruta = path.join(__dirname, 'uploads/', filename);
  const formData = new FormData();
  formData.append('file', (ruta));
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', mimetype);

  try {

    const resApiWhatsapp = await axios.postForm(`${urlMeta}/media`, {
      "file": fs.createReadStream(ruta),
      "messaging_product": "whatsapp",
      "type": mimetype
    }, {
      headers: {
        ...formData.getHeaders(),
        "Authorization": `Bearer ${process.env.WHATSAPP_API_KEY}`
      },
    });
    if (resApiWhatsapp.statusText !== "OK") {
      return false;
    }
    return resApiWhatsapp.data
  } catch (e) {
    console.log("Error <<<<<", e.response.data);
  };
};

const GuardarMensajeRecibido = async (id, texto, telefono, tipo, urlDocumento, filename) => {
  try {
    const mensaje = {
      fecha: newFecha(),
      emisor: 'Paciente',
      tipo,
      filename,
      urlDocumento,
      mensaje: texto,
      mensajeId: id,
      leido: false,
    };
    const paciente = await Paciente.findOneAndUpdate(
      { telefono },
      { $push: { chats: mensaje } },
      { new: true });
    const ultimoMsg = paciente.chats[paciente.chats.length - 1];
    const { uid } = paciente.usuarioAsignado;
    return {
      ok: true,
      ultimoMsg,
      uid
    };
  } catch (error) {
    return MensajeError('No se pudo guardar el mensaje', error);
  };
};


module.exports = {
  GuardarMensajeRecibido,
  SendFileWhatsApp,
  SendMessageWhatsApp,
  SetFileWhatsApp,
  VerifyToken,
  Whatsapp,
}

// {
//   "messaging_product": "whatsapp",
//   "contacts": [
//     { "input": "52155555555555", "wa_id": "521555555555555" }
//   ],
//   "messages": [
//     { "id": "wamid.id" }
//   ]
// }