const { response } = require('express');
require('dotenv').config();
const https = require('https');
const Paciente = require('../models/paciente');
const axios = require('axios');
const path = require('path');
const { MensajeError } = require('../helpers/error');
const FormData = require('form-data');
const fs = require('fs');
const { urlMeta } = require('../cons/urls');
const { optionsMessage } = require('../cons/optionsMessage');
const { numeroTelefono, rutaDescargaArchivoRecibido, newFecha } = require('../helpers/funciones');
const { buscarNumeroExistente, obtenerPacientesPorUsuario } = require('./paciente');
const { agregarPendiente, obtenerPendientes } = require('./sinAsignar');

const Whatsapp = async (req, res = response) => {

  try {
    const entry = req.body['entry'][0];
    const changes = entry['changes'][0];
    const value = changes['value'];
    const messageObject = value['messages'];

    if (typeof messageObject !== 'undefined') {
      const type = messageObject[0]['type'];
      if (type === 'text') {
        const messages = messageObject[0];
        const text = messages['text']['body'];
        const number = numeroTelefono(messages);
        const resExistente = await buscarNumeroExistente(number);
        if (resExistente.ok === false) {
          const respPendientes = await agregarPendiente(text, number, type);
          if (!respPendientes.err) {
            req.io.emit('mensajes-sinAsignar', await obtenerPendientes());
          }
        } else {
          const mensaje = await GuardarMensajeRecibido(text, number, type);
          const { ultimoMsg, id } = mensaje;
          req.io.to(id).emit('mensaje-recibido', { ultimo: ultimoMsg, telefono: number });
          req.io.to(id).emit('mis-mensajes', await obtenerPacientesPorUsuario(resExistente.usuarioAsignado.email));
        };
      };
      if (type === 'image') {
        const messages = messageObject[0];
        const number = numeroTelefono(messages);
        const {ruta} = await rutaDescargaArchivoRecibido(messages, number, type);
        const resExistente = await buscarNumeroExistente(number);
        if (resExistente.ok === false) {
          const respPendientes = await agregarPendiente('Imagen Recibido', number, type, ruta);
          if (!respPendientes.err) {
            req.io.emit('mensajes-sinAsignar', await obtenerPendientes());
          }
        }
        else {
          const mensaje = await GuardarMensajeRecibido('Imagen Recibido',number, type, ruta);
          const { ultimoMsg, id } = mensaje;
          req. io.to(id).emit('mensaje-recibido', { ultimo: ultimoMsg, telefono: number });
          req.io.to(id).emit('mis-mensajes', await obtenerPacientesPorUsuario(resExistente.usuarioAsignado.email));
        };
      }
      if (type === 'document') {
        const messages = messageObject[0];
        const number = numeroTelefono(messages);
        const { ruta, filename } = await rutaDescargaArchivoRecibido(messages, number, type);
        const resExistente = await buscarNumeroExistente(number);
        if (resExistente.ok === false) {
          const respPendientes = await agregarPendiente('Documento Recibido',number, type, ruta, filename);
          if (!respPendientes.err) {
            req.io.sockets.emit('mensajes-sinAsignar', await obtenerPendientes());
          }
        }
        else {
          const mensaje = await GuardarMensajeRecibido('Documento Recibido',number, type, ruta, filename);
          const { ultimoMsg, id } = mensaje;
          req.io.to(id).emit('mensaje-recibido', { ultimo: ultimoMsg, telefono: number });
          req.io.to(id).emit('mis-mensajes', await obtenerPacientesPorUsuario(resExistente.usuarioAsignado.email));

          // const data = SampleDocument(number, documentId, filename);
          // SendDocumentWhatsApp(data);
        };
      };
    };
    res.send('EVENT_RECEIVED');
  } catch (error) {
    console.log(error);
    res.send('EVENT_RECEIVED');
  };
}


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

  try {
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
    
  } catch (error) {
    console.log(error);
  }
};

const SendImageWhatsApp = async (data) => {
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
  }

};

const SendDocumentWhatsApp = async (data) => {
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
  }

};

const SetFileWhatsApp = async (filename, mimetype, telefono, pathFile) => {
  const ruta = path.join(__dirname, 'uploads/', filename );
  const formData = new FormData();
  formData.append('file', (ruta));
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', mimetype);

  try {

    const resApiWhatsapp = await axios.postForm( `${urlMeta}/media`, {
      "file":fs.createReadStream(ruta),
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

const GuardarMensajeRecibido = async (texto, telefono, tipo, urlDocumento, filename) => {
  try {
    const mensaje = {
      fecha: newFecha(),
      emisor: 'Paciente',
      tipo,
      filename,
      urlDocumento,
      mensaje: texto,
      leido: false,
    };
    const paciente = await Paciente.findOneAndUpdate(
      { telefono },
      { $push: { chats: mensaje } },
      { new: true });
    const ultimoMsg = paciente.chats[paciente.chats.length - 1];
    const { id } = paciente.usuarioAsignado;
    return { 
      ok:true,
      ultimoMsg, 
      id
    };
  } catch (error) {
    return MensajeError('No se pudo guardar el mensaje', error);
  };
};


module.exports = {
  VerifyToken,
  SendMessageWhatsApp,
  GuardarMensajeRecibido,
  SendImageWhatsApp,
  SendDocumentWhatsApp,
  SetFileWhatsApp,
  Whatsapp,
}