//Servidor Express
const express = require('express');
const cors = require('cors');
const dayjs = require('dayjs');
const { dbConnection } = require('../database/config');
const socketio = require('socket.io');
const { comprobarJWT } = require('../helpers/jwt');
const { obtenerPendientes, agregarPendientes } = require('../controller/sinAsignar');
const { obtenerPacientesPorUsuario, agregarPaciente, obtenerConversacionActual, guardarMensajeEnviado, buscarNumeroExistente } = require('../controller/paciente');
const { check } = require('express-validator');
const sinAsignar = require('../models/sinAsignar');
const { VerifyToken, GuardarMensajeRecibido, SendMessageWhatsApp, GetTextUser } = require('../controller/whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = socketio(server, {
  cors: {
    origin: ['http://localhost:5173', '172.30.96.1:5173', '192.168.16.78:5173'],
    credentials: true,
  }
});

//DB
dbConnection();

app.use(express.static(__dirname + '/public'));

//middlWares
//Parseo de los datos que llegan desde postman - Parseo del body
let UsuarioActual = {};
app.use(express.json());
// CORS
app.use(cors());
//rutas

app.use('/api/Login', require('../router/auth'));
app.get('/api/whatsapp', VerifyToken);
app.post('/api/whatsapp', async (req, res = express.response) => {
  try {
    const entry = req.body['entry'][0];
    const changes = entry['changes'][0];
    const value = changes['value'];
    const messageObject = value['messages'];
    if (typeof messageObject !== 'undefined') {
      const messages = messageObject[0];
      const text = GetTextUser(messages);
      const number = messages['from'];
      console.log('Mensaje: ', text);
      console.log('Para: ', number);

      let newNumber = '';
      if (number.length === 13 && number.startsWith('521')) {
        newNumber = '52' + number.slice(3, 13);
      }

      console.log('numeroEnAsignar: ', newNumber);
      console.log(UsuarioActual);
      if (buscarNumeroExistente(newNumber, UsuarioActual.email)) {
        console.log('encontrado');
        // const mensajeGuardado = await GuardarMensajeRecibido(text, newNumber);
        // io.sockets.emit('mis-mensajes', await obtenerPacientesPorUsuario(UsuarioActual.email));
        // SendMessageWhatsApp(text);
      }else{
        console.log('no encontrado');
        // const nuevoPendiente = await agregarPendientes(text, newNumber);
        // io.sockets.emit('nuevo-mensaje', `nuevo mensaje al numero: ${newNumber}`);
        // SendMessageWhatsApp(text);
      }
    };
    res.send('EVENT_RECEIVED');
  } catch (error) {
    console.log(error);
    // myConsole.log(error);
    res.send('EVENT_RECEIVED');
  };
})
app.post('/api/sinAsignar', [
  check('telefono', 'El telefono es obligatorio').not().isEmpty(),
  check('mensaje', 'El mensaje es obligatorio').not().isEmpty()],
  async (req, res = express.response) => {
    try {
    const entry = req.body['entry'][0];
    const changes = entry['changes'][0];
    const value = changes['value'];
    const messageObject = value['messages'];
    if (typeof messageObject !== 'undefined') {
      const messages = messageObject[0];
      const text = GetTextUser(messages);
      const number = messages['from'];
      console.log('Mensaje: ', text);
      console.log('Para: ', number);

      let newNumber = '';
      if (number.length === 13 && number.startsWith('521')) {
        newNumber = '52' + number.slice(3, 13);
      }

      console.log('numeroEnAsignar: ', newNumber);
      if (buscarNumeroExistente(newNumber) === false) {
        const nuevoPendiente = await agregarPendientes(text, newNumber);
        io.sockets.emit('nuevo-mensaje', `nuevo mensaje al numero: ${newNumber}`);
        SendMessageWhatsApp(text);
      }else{
        const mensajeGuardado = await GuardarMensajeRecibido(text, newNumber);
        io.sockets.emit('mis-mensajes', await obtenerPacientesPorUsuario(UsuarioActual.email));
        SendMessageWhatsApp(text);
      }
    };
    res.send('EVENT_RECEIVED');
  } catch (error) {
    console.log(error);
    // myConsole.log(error);
    res.send('EVENT_RECEIVED');
  };
  });


//io
io.on('connection', async (socket) => {
  console.log(socket.handshake.query['auth']);
  const [valido, user] = comprobarJWT(socket.handshake.query['auth']);
  if (!valido) {
    console.log('socket no identificado');
    return socket.disconnect();
  };
  console.log('Nuevo cliente conectado:', user);
  UsuarioActual = user;
  socket.emit('mensajes-sinAsignar', await obtenerPendientes());
  socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));

  socket.on('paciente-asignado', async (data) => {
    await agregarPaciente(data);
    io.emit('mensajes-sinAsignar', await obtenerPendientes());
    socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));
  });

  socket.on('conversacion-actual', async (telefono, callback) => {
    const msgs = await obtenerConversacionActual(telefono, user.email);
    callback(msgs);
    socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));
  });

  socket.on('mensaje-personal', async (data, callback) => {
    const { telefono, nombre, emisor, fecha, leido, mensaje } = data;
    const ultimo = await guardarMensajeEnviado(telefono, user.email, { emisor, fecha, leido, mensaje });
    if (ultimo) {
      callback(ultimo);
      SendMessageWhatsApp(mensaje, telefono);
      socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log('Servidor corriendo en el puerto: ', PORT);
})

// git branch -M main
// git push -u origin main