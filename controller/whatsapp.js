const { response } = require('express');
const axios = require('axios');
const https = require('https');
const path = require('path');
const FormData = require('form-data');
const fs = require('fs');
const Paciente = require('../models/paciente');
const { MensajeError } = require('../helpers/error');
const { urlMeta } = require('../cons/urls');
const { authFacebook } = require('../cons/optionsMessage');
const { numeroTelefono, rutaDescargaArchivoRecibido, newFecha, mostrarDatosEntradaWhatsapp } = require('../helpers/funciones');
const { buscarNumeroExistente, obtenerPacientesPorUsuario, guardarReplyMensajeEnviado } = require('./paciente');
const { agregarPendiente, obtenerPendientes } = require('./sinAsignar');
const { SampleText, ReplyText, ReplyDocument, MessageStatus } = require('../helpers/textTypes');
const { typeMessages } = require('../cons/typeMessages');

const processMessage = async (req, messages, additionalData = {}) => {
  const { type, from, id, context } = messages;
  const number = numeroTelefono(from);
  const messageContent = type === 'text' ? messages['text']['body'] : typeMessages[type];
  const resExistente = await buscarNumeroExistente(number);
  if (resExistente.ok === false) {
    const respPendientes = await agregarPendiente(id, messageContent, number, type, context, ...Object.values(additionalData));
    if (!respPendientes.err) {
      req.io.emit('mensajes-sinAsignar', await obtenerPendientes());
    };
  } else if (resExistente.ok) {
    const mensaje = await GuardarMensajeRecibido(id, messageContent, number, type, context, ...Object.values(additionalData));
    const { ultimoMsg, uid } = mensaje;
    req.io.to(uid).emit('mensaje-recibido', { ultimo: ultimoMsg, telefono: number });
    req.io.to(uid).emit('mis-mensajes', await obtenerPacientesPorUsuario(resExistente.usuarioAsignado.uid));
  };
};

const Whatsapp = async (req, res = response) => {
  //Aqui empieza con la llegada de los mensajes desde whatsapp
  try {
    mostrarDatosEntradaWhatsapp(req.body);
    const entry = req.body['entry'][0];
    const changes = entry['changes'][0];
    const value = changes['value'];
    const messageObject = value['messages'];
    if (messageObject) {
      const type = messageObject[0]['type'];
      const messages = messageObject[0];

      if (type === 'text') {
        await processMessage(req, messages);
      } else {
        const { ruta, filename, caption } = await rutaDescargaArchivoRecibido(messages);
        await processMessage(req, messages, { ruta, filename, caption });
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
  try {
    const data = SampleText(number, textResponse);
    const res = await axios.post(`${urlMeta}/messages`, data, authFacebook);
    if (res.status !== 200) {
      return MensajeError('Error al enviar el mensaje en -->SendMessage', res.statusText);
    }
    const {messages} = res.data;
    return messages[0].id;  
  } catch (error) {
    return MensajeError('Error en -->SendMessageWhatsApp', error);
  };
};

const ReplyMessages = async (data)=>{
  const { telefono, emisor, fecha, leido, mensaje, user, tipo, message_id,filename } = data;
  let mensajeId = '';
  if (tipo === 'text') {
    mensajeId = await SendReplyMessageWhatsApp(mensaje, telefono, message_id);
  };
  if (tipo === 'document') {
  };

  const ultimo = await guardarReplyMensajeEnviado(telefono, user.uid, { emisor, fecha, leido, mensaje, tipo, mensajeId, context:{message_id}, filename});
  return ultimo;
}

const SendReplyMessageWhatsApp = async (textResponse, number, id) => {
  try {
    const data = ReplyText(number, textResponse, id);
    const res = await axios.post(`${urlMeta}/messages`, data, authFacebook);
    if (res.status !== 200) {
      return MensajeError('Error al enviar el mensaje en -->SendReplyMessage', res.statusText);
    }
    const {messages} = res.data;
    return messages[0].id;  
  } catch (error) {
    return MensajeError('Error en -->SendReplyMessageWhatsApp', error);
  }
};

const SendFileWhatsApp = async (data) => {
  try {
    const res = await axios.post(`${urlMeta}/messages`, data, authFacebook);
    if (res.status !== 200) {
      return MensajeError('Error al enviar el mensaje en -->SendFileWhatsApp', res.statusText);
    };
    const {messages} = res.data;
    return messages[0];  
  } catch (error) {
    return MensajeError('Error en -->SendFileWhatsApp', error);
  };
};

const SendReplyFileWhatsApp = async (data) => {
  try {
    const dataReply = ReplyDocument(data);
    const res = await axios.post(`${urlMeta}/messages`, dataReply, authFacebook);
    if (res.status !== 200) {
      return MensajeError('Error al enviar el mensaje en -->SendReplyFileWhatsApp', res.statusText);
    }
    const {messages} = res.data;
    return messages[0].id;  
  } catch (error) {
    return MensajeError('Error en -->SendReplyFileWhatsApp', error);
  }
};

const SetFileWhatsApp = async (filename, mimetype) => {
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

const GuardarMensajeRecibido = async (id, texto, telefono, tipo,context, urlDocumento, filename, caption) => {
  try {
    const mensaje = {
      fecha: newFecha(),
      emisor: 'Paciente',
      tipo,
      filename,
      urlDocumento,
      caption,
      mensaje: texto,
      mensajeId: id,
      leido: false,
      context,
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

const MensajeLeido = async(id)=>{
  try {
    const data = MessageStatus(id);
    const res = await axios.post(`${urlMeta}/messages`, data, authFacebook);
    if (res.status !== 200) {
      return MensajeError('Error al enviar el mensaje en -->MensajeLeido', res.statusText);
    };
    const {status} = res.data;
    return messages[0].id;  
  } catch (error) {
    return MensajeError('Error en -->MensajeLeido', error);
  };
}


module.exports = {
  GuardarMensajeRecibido,
  MensajeLeido,
  ReplyMessages,
  SendFileWhatsApp,
  SendReplyFileWhatsApp,
  SendReplyMessageWhatsApp,
  SendMessageWhatsApp,
  SetFileWhatsApp,
  VerifyToken,
  Whatsapp,
};