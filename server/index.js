//Servidor Express
const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config');
const socketio = require('socket.io');
const { comprobarJWT } = require('../helpers/jwt');
const { obtenerPendientes, agregarPendientes } = require('../controller/sinAsignar');
const { obtenerPacientesPorUsuario, agregarPaciente, obtenerConversacionActual, guardarMensajeEnviado, buscarNumeroExistente } = require('../controller/paciente');
const { check } = require('express-validator');
const { VerifyToken, GuardarMensajeRecibido, SendMessageWhatsApp, SendImageWhatsApp, SendPdfWhatsApp } = require('../controller/whatsapp');
const { SampleImage, SampleDocument } = require('../helpers/textTypes');
const { numeroTelefono, idImagen, idPdf } = require('../helpers/funciones');

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
      const type = messageObject[0]['type'];
      if (type === 'text') {
        const messages = messageObject[0];
        const text = messages['text']['body'];
        const number = numeroTelefono(messages);
        const res = await buscarNumeroExistente(number);

        if (res.ok === false) {
          await agregarPendientes(text, number);
          io.sockets.emit('mensajes-sinAsignar', await obtenerPendientes());
        } else {
          const mensaje = await GuardarMensajeRecibido(text, number);
          const {ultimoMsg, id} = mensaje;
          io.to(id).emit('mensaje-recibido', { ultimo: ultimoMsg, telefono: number });
          io.to(id).emit('mis-mensajes', await obtenerPacientesPorUsuario(res.usuarioAsignado.email));
          SendMessageWhatsApp(text);
        }
      }
      if (type === 'image') {
        const messages = messageObject[0];
        const number = numeroTelefono(messages);
        const id = idImagen(messages);
        const data = SampleImage(number);
        SendImageWhatsApp(data, id);
      }
      if (type === 'document') {
        const messages = messageObject[0];
        const number = numeroTelefono(messages);
        const id = idPdf(messages);
        const data = SampleDocument(number);
        SendPdfWhatsApp(data, id);
      };
    };
    res.send('EVENT_RECEIVED');
  } catch (error) {
    console.log(error);
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
  const [valido, user] = comprobarJWT(socket.handshake.query['auth']);
  if (!valido) {
    console.log('socket no identificado');
    return socket.disconnect();
  };
  console.log('Nuevo cliente conectado:', user);
  socket.join(user.id);

  //enviar todos los mensajes sin asignar
  socket.emit('mensajes-sinAsignar', await obtenerPendientes());

  //enviar los pacientes asignados 
  socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));

  //asignar a los pacientes a un usuario
  socket.on('paciente-asignado', async (user) => {
    await agregarPaciente(user);
    io.emit('mensajes-sinAsignar', await obtenerPendientes());
    socket.to(user.id).emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));
  });

  //conversación actual
  socket.on('conversacion-actual', async ({ email, telefono, id }, callback) => {
    const msgs = await obtenerConversacionActual(telefono, email);
    callback(msgs);
  });

  socket.on('mensaje-enviado', async (data, callback) => {
    const { telefono, emisor, fecha, leido, mensaje, user } = data;
    const ultimo = await guardarMensajeEnviado(telefono, user.email, { emisor, fecha, leido, mensaje });
    if (typeof (ultimo) === 'object') {
      callback(ultimo);
      SendMessageWhatsApp(mensaje, telefono);
      socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));
    } else {
      callback(ultimo);
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