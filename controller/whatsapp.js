const axios = require('axios');
const { response } = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();
const dayjs = require('dayjs');
const Paciente = require('../models/paciente');
const { obtenerImagen, obtenerUrlImagen, guardarImagen } = require('../helpers/obtenerImagen');
const { obtenerPdf, obtenerIdPdf, guardarPdf, obtenerUrlPdf } = require('../helpers/obtenerPdf');
const { MensajeError } = require('../helpers/error');
const { uploadBlobImagen, uploadBlobPdf } = require('../helpers/cargarArchivo');
const { downloadBlobBlob, downloadBlob, downloadBlobImagen } = require('../helpers/descargarArchivo');

const VerifyToken = (req, res = response) => {
  try {
    const accessToken = "RUATOUAOSNRUAO";
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

const SendMessageWhatsApp = (textResponse, number = '525531014209') => {
  //guardar información para el envio de datos a facebook
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "text",
    "text": {
      "body": textResponse
    }
  });
  const options = {
    host: 'graph.facebook.com',
    path: '/v20.0/440395809154094/messages',
    method: 'POST',
    body: textResponse,
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`
    }
  };

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
};

const SendImageWhatsApp = async (data, id) => {
  //obtener id de imagen y guardarlo
  // const resImagen = await obtenerUrlImagen(id);
  // const docRespuesta = await guardarImagen(resImagen, id);
  // console.log(docRespuesta);
  // if (docRespuesta !== true) {
  //   return;
  // };
  // await uploadBlobImagen(id)
  //   .catch((err) => console.error('Error subiendo el blob:', err.message));

  await downloadBlobImagen()
    .catch((err) => console.error('Error descargando el blob:', err.message));

  //guardar información para el envio de datos a facebook
  const options = {
    host: 'graph.facebook.com',
    path: '/v20.0/440395809154094/messages',
    method: 'POST',
    body: data,
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${process.env.WHATSAPP_API_KEY}`
    }
  };

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
};

const SendPdfWhatsApp = async (data, id) => {
  //obtener id de pdf y guardarlo
  const resPdf = await obtenerUrlPdf(id);
  const docRespuesta = await guardarPdf(resPdf, id);
  console.log(docRespuesta);
  if (docRespuesta !== true) {
    return;
  };

  await uploadBlobPdf(id)
    .catch((err) => console.error('Error subiendo el blob:', err.message));

  //guardar información para el envio de datos a facebook
  const options = {
    host: 'graph.facebook.com',
    path: '/v20.0/440395809154094/messages',
    method: 'POST',
    body: data,
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${process.env.WHATSAPP_API_KEY}`
    }
  };

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
};

const SampleSendMessageWhatsApp = async (data, id = '1071889021132057') => {
  const options = {
    host: 'graph.facebook.com',
    path: '/v20.0/440395809154094/messages',
    method: 'POST',
    data: JSON.stringify({
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": '525531014209',
      "type": "image",
      "image": {
        "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/image_whatsapp.png"
      }
    }),
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${process.env.WHATSAPP_API_KEY}`
    }
  };
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
};

const GuardarMensajeRecibido = async (texto, telefono) => {
  try {
    const mensaje = {
      fecha: dayjs().format('DD/MM/YYYY HH:mm a'),
      mensaje: texto,
      leido: false,
      emisor: 'Paciente'
    };
    const paciente = await Paciente.findOneAndUpdate(
      { telefono },
      { $push: { chats: mensaje } },
      { new: true });

    const ultimoMsg = paciente.chats[paciente.chats.length - 1];
    const { id } = paciente.usuarioAsignado;
    return { ultimoMsg, id };
  } catch (error) {
    console.log(error);
    return 'No se pudo guardar el mensaje';
  };
};

module.exports = {
  VerifyToken,
  SendMessageWhatsApp,
  GuardarMensajeRecibido,
  SampleSendMessageWhatsApp,
  SendImageWhatsApp,
  SendPdfWhatsApp,
}