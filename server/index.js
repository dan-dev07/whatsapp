//Servidor Express
const express = require('express');
const cors = require('cors');
const dayjs = require('dayjs');
const { dbConnection } = require('../database/config');
const socketio = require('socket.io');
const { comprobarJWT } = require('../helpers/jwt');
const { obtenerPendientes, agregarPendientes, agregarNuevoPendiente, agregarNuevoMensajePendiente } = require('../controller/sinAsignar');
const { obtenerPacientesPorUsuario, agregarPaciente, obtenerConversacionActual, guardarMensajeEnviado, buscarNumeroExistente } = require('../controller/paciente');
const { check } = require('express-validator');
const SinAsignar = require('../models/sinAsignar');
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
let UsuarioActual = [];
//Parseo de los datos que llegan desde postman - Parseo del body
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
      };

      console.log('numeroEnAsignar: ', newNumber);
      console.log(UsuarioActual);

      const res = await buscarNumeroExistente(newNumber);
      if (res.ok === false) {
        await agregarPendientes(text, newNumber);
        console.log('pendiente agregado');
        io.sockets.emit('mensajes-sinAsignar', await obtenerPendientes());
        // io.sockets.emit('mis-mensajes', await obtenerPacientesPorUsuario(UsuarioActual.email));
        // io.to(res.usuarioAsignado.id).emit('mis-mensajes', await obtenerPacientesPorUsuario(UsuarioActual.email));
      }else{
        const ultimo = await GuardarMensajeRecibido(text, newNumber);
        console.log('paciente actualizado');
        // io.sockets.emit('mis-mensajes', await obtenerPacientesPorUsuario(UsuarioActual.email));
        io.to(res.usuarioAsignado.id).emit('mis-mensajes', await obtenerPacientesPorUsuario(res.usuarioAsignado.email));
        io.to(res.usuarioAsignado.id).emit('mensaje-recibido', {ultimo, telefono:newNumber });
        // io.sockets.emit('mensaje-recibido', {ultimo, telefono:newNumber } );
        SendMessageWhatsApp(text);
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
          await agregarPendientes(text, newNumber);
          io.sockets.emit('nuevo-mensaje', `nuevo mensaje al numero: ${newNumber}`);
          SendMessageWhatsApp(text);
        } else {
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
  // console.log(socket.handshake.query['auth']);
  const [valido, user] = comprobarJWT(socket.handshake.query['auth']);
  if (!valido) {
    console.log('socket no identificado');
    return socket.disconnect();
  };
  console.log('Nuevo cliente conectado:', user);

  socket.join(user.id);

  socket.emit('mensajes-sinAsignar', await obtenerPendientes());
  socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));

  socket.on('actualizar-mensajes', async user=>{
    socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));
  })

  socket.on('mis-mensajes', async (usuario, callback) => {
    console.log('regreso');
    const msgs = await obtenerPacientesPorUsuario(usuario.email);
    callback(msgs);
    // socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));
  });

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

  socket.on('mensaje-enviado', async (data, callback) => {
    const { telefono, emisor, fecha, leido, mensaje } = data;
    const ultimo = await guardarMensajeEnviado(telefono, user.email, { emisor, fecha, leido, mensaje });
    if (ultimo) {
      callback(ultimo);
      SendMessageWhatsApp(mensaje, telefono);
      socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));
    }else{
      callback('no se pudo enviar el mensaje')
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