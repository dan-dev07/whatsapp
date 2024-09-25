const fs = require('fs');
const https = require('https');
const Paciente = require('../models/paciente');
const dayjs = require('dayjs');
const { response } = require('express');
// const myConsole = new console.Console(fs.createWriteStream('./logs.txt'));
// const SocketSingleton = require('../models/socketSingleton');
const VerifyToken = (req, res=response ) => {
  try {
    const accessToken = "RUATOUAOSNRUAO";
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (challenge !== null && token !== null && token == accessToken) {
      res.send(challenge);
    }else{
      res.status(400).send();
    };
  } catch (error) {
    res.status(400).send();
  };
};

const MensajeRecibido = (req, res ) => {
  
  try {
    const entry = req.body['entry'][0];
    const changes = entry['changes'][0];
    const value = changes['value'];
    const messageObject = value['messages'];
    if (typeof messageObject !== 'undefined') {
      const messages = messageObject[0];
      const text = GetTextUser(messages);
      const number = messages['from'];
      console.log('Mensaje: ',text);
      console.log('Para: ',number);
      // myConsole.log(text);
      SendMessageWhatsApp(text, number);
    };
    

    res.send('EVENT_RECEIVED');
    return true;
  } catch (error) {
    console.log(error);
    // myConsole.log(error);
    res.send('EVENT_RECEIVED');
    return false;
  };
};

const GetTextUser = (messages) => {
  let text = '';
  let typeMessage = messages['type'];
  if (typeMessage === 'text') {
    text = messages['text']['body'];
  }else if (typeMessage === 'interactive') {
    const interactiveObject = messages['interactive'];
    const typeInteractive = interactiveObject['type'];

    if (typeInteractive === 'button_reply') {
      text = interactiveObject['button_reply']['title'];
    }else if (typeInteractive === 'list_reply') {
      text = interactiveObject['list_reply']['title'];
    }else{
      myConsole.log('sin mensaje');
    };
  }else{
    myConsole.log('sin mensaje');    
  };

  return text;
};

const SendMessageWhatsApp = (textResponse, number='525531014209') => {

  console.log('SendMessage: ', number);
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
    host:'graph.facebook.com',
    path:'/v20.0/440395809154094/messages',
    method:'POST',
    body:data,
    headers :{
      "Content-type":"application/json",
      Authorization: "Bearer EAAHjCGUicZC8BO2R7r7R3ZB9zLxrIKMxBBYHVHRsVsDL4JTRBmh1mrCNe4MHYoGGhDRueQg2OGEB8pP309QwfsQAuLxkCZCoFN3yE50m8DXKaN3GCSTrn1X8LtwKyWZAbkHP3eTVqKOWzH226HYSns2XOxnqMSUf6WtwZCdWCXN5ora4cYMO7LScKU2sGiwasrKSEo5yrNh2i9Irpc8ZC2ao7Dix0mxIce5fUvdAcZD"
    }
  };
  const req = https.request(options, res=>{
    res.on('data', d=>{
      process.stdout.write(d);
    });  
  });
  req.on('error', error =>{
    console.error('error: ',error);
  });
  req.write(data);
  req.end();
};

const GuardarMensajeRecibido =async (texto, telefono)=>{  
  try {
    const mensaje = {
      fecha: dayjs().format('DD/MM/YYYY HH:mm a'),
      mensaje:texto,
      leido:false,
      emisor:'Paciente'
    };
    const paciente = await Paciente.findOneAndUpdate(
      {telefono},
      { $push: { chats:mensaje }},
      {new:true});
    
    // const ultimo = paciente.chats[paciente.chats.length -1];
    // return ultimo;
  } catch (error) {
    console.log(error);
    return 'No se pudo guardar el mensaje';
  };
};

module.exports = {
  VerifyToken,
  MensajeRecibido,
  GetTextUser,
  SendMessageWhatsApp,
  GuardarMensajeRecibido,
}