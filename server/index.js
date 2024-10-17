//Servidor Express
const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config');
const socketio = require('socket.io');
const { comprobarJWT } = require('../helpers/jwt');
const { obtenerPendientes, agregarPendiente } = require('../controller/sinAsignar');
const { obtenerPacientesPorUsuario, agregarPaciente, obtenerConversacionActual, guardarMensajeEnviado, buscarNumeroExistente } = require('../controller/paciente');
const { VerifyToken, GuardarMensajeRecibido, SendMessageWhatsApp, SendImageWhatsApp, SendDocumentWhatsApp } = require('../controller/whatsapp');
const { SampleImage, SampleDocument } = require('../helpers/textTypes');
const { numeroTelefono, rutaDescargaArchivoRecibido } = require('../helpers/funciones');

const app = express();
const PORT = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = socketio(server, {
  cors: {
    origin: ['http://localhost:5173', '172.30.96.1:5173', '192.168.16.78:5173','https://stupendous-tarsier-6726ab.netlify.app/'],
    credentials: true,
  }
});

//DB
dbConnection();

app.use(express.static(__dirname + '/public'));

//middlWares
app.use((req, res, next) => {
  req.io = io; // Almacena io en req
  next();
});
//Parseo de los datos que llegan desde postman - Parseo del body
app.use(express.json());
// CORS
app.use(cors());
//rutas
app.use('/api/media', require('../router/media'));
app.use('/api/Login', require('../router/auth'));
app.get('/api/whatsapp', VerifyToken);
app.post('/api/whatsapp', async (req, res = express.response) => {

  try {
    const entry = req.body['entry'][0];
    const changes = entry['changes'][0];
    const value = changes['value'];
    const messageObject = value['messages'];
    console.log(entry);

    if (typeof messageObject !== 'undefined') {
      const type = messageObject[0]['type'];
      if (type === 'text') {
        const messages = messageObject[0];
        const text = messages['text']['body'];
        const number = numeroTelefono(messages);
        const resExistente = await buscarNumeroExistente(number);
        if (resExistente.ok === false) {
          const respPendientes = await agregarPendiente(text, number, type);
          if (respPendientes.ok) {
            io.emit('mensajes-sinAsignar', await obtenerPendientes());
          }
        } else {
          const mensaje = await GuardarMensajeRecibido(text, number, type);
          const { ultimoMsg, id } = mensaje;
          io.to(id).emit('mensaje-recibido', { ultimo: ultimoMsg, telefono: number });
          io.to(id).emit('mis-mensajes', await obtenerPacientesPorUsuario(resExistente.usuarioAsignado.email));
          // SendMessageWhatsApp(text);
        };
      };
      if (type === 'image') {
        const messages = messageObject[0];
        const number = numeroTelefono(messages);
        const {ruta, id:imagenId} = await rutaDescargaArchivoRecibido(messages, number, type);
        console.log('ruta',ruta);
        const resExistente = await buscarNumeroExistente(number);
        if (resExistente.ok === false) {
          const respPendientes = await agregarPendiente('Imagen Recibido', number, type, ruta);
          if (!respPendientes.error) {
            io.emit('mensajes-sinAsignar', await obtenerPendientes());
          }
        }
        else {
          const mensaje = await GuardarMensajeRecibido('Imagen Recibido',number, type, ruta);
          const { ultimoMsg, id } = mensaje;
          console.log('ultimoMsg',ultimoMsg);
          io.to(id).emit('mensaje-recibido', { ultimo: ultimoMsg, telefono: number });
          io.to(id).emit('mis-mensajes', await obtenerPacientesPorUsuario(resExistente.usuarioAsignado.email));
          // const data = SampleImage(number, imagenId);
          // SendImageWhatsApp(data);
        };
      }
      if (type === 'document') {
        const messages = messageObject[0];
        const number = numeroTelefono(messages);
        const { ruta, filename, id:documentId } = await rutaDescargaArchivoRecibido(messages, number, type);
        const resExistente = await buscarNumeroExistente(number);
        if (resExistente.ok === false) {
          const respPendientes = await agregarPendiente('Documento Recibido',number, type, ruta, filename);
          if (!respPendientes.err) {
            io.sockets.emit('mensajes-sinAsignar', await obtenerPendientes());
          }
        }
        else {
          const mensaje = await GuardarMensajeRecibido('Documento Recibido',number, type, ruta, filename);
          const { ultimoMsg, id } = mensaje;
          io.to(id).emit('mensaje-recibido', { ultimo: ultimoMsg, telefono: number });
          io.to(id).emit('mis-mensajes', await obtenerPacientesPorUsuario(resExistente.usuarioAsignado.email));

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
    io.to(user.id).emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));
  });

  //conversación actual
  socket.on('conversacion-actual', async ({ email, telefono, id }, callback) => {
    const msgs = await obtenerConversacionActual(telefono, email);
    callback(msgs);
  });

  socket.on('mensaje-enviado', async (data, callback) => {
    const { telefono, emisor, fecha, leido, mensaje, user, tipo } = data;
    const ultimo = await guardarMensajeEnviado(telefono, user.email, { emisor, fecha, leido, mensaje, tipo });
    callback(ultimo);
    SendMessageWhatsApp(mensaje, telefono);
    socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.email));
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