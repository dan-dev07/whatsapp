//Servidor Express
const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config');
const socketio = require('socket.io');
const validarJWT = require('../helpers/validarJWT');
const { comprobarJWT } = require('../helpers/jwt');
const { obtenerPendientes, agregarPendiente, agregarDesdePaciente } = require('../controller/sinAsignar');
const { obtenerPacientesPorUsuario, agregarPaciente, obtenerConversacionActual, guardarMensajeEnviado, quitarUsuario, reasignarPaciente, guardarReplyMensajeEnviado } = require('../controller/paciente');
const { SendMessageWhatsApp, SendReplyMessageWhatsApp } = require('../controller/whatsapp');
const { actulizarEstado } = require('../controller/usuario');

const app = express();
const PORT = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = socketio(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://189.131.186.39:5173','https://jovial-malasada-025646.netlify.app'],
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

//validar token
// app.use(validarJWT);

//rutas
app.use('/api/Login', require('../router/auth'));
app.use('/api/media', require('../router/media'));
app.use('/api/Usuarios', require('../router/usuarios'));
app.use('/api/whatsapp', require('../router/whatsapp'));
app.use('/api/datos', require('../router/datos'));
app.use('/api/ver', require('../router/version'));

//io
io.on('connection', async (socket) => {
  const [valido, user] = comprobarJWT(socket.handshake.query['auth']);
  if (!valido) {
    console.log('socket no identificado');
    return socket.disconnect();
  };
  console.log('Nuevo cliente conectado:', user.nombre);
  socket.join(user.uid);

  //enviar todos los mensajes sin asignar
  socket.emit('mensajes-sinAsignar', await obtenerPendientes());

  //enviar los pacientes asignados 
  socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.uid));

  //asignar a los pacientes a un usuario
  socket.on('paciente-asignado', async (datos, callback) => {
    const paciente = await agregarPaciente(datos);
    if (!paciente.err) {
      io.emit('mensajes-sinAsignar', await obtenerPendientes());
      io.to(datos.userUid).emit('mis-mensajes', await obtenerPacientesPorUsuario(datos.userUid));
    };
    callback(paciente);
  });

  socket.on('mensaje-enviado', async (data, callback) => {
    try {
      const { telefono, emisor, fecha, leido, mensaje, user, tipo, message_id } = data;
      let mensajeId = '';
      if (message_id?.startsWith('wamid.')) {
        mensajeId = await SendReplyMessageWhatsApp(mensaje, telefono, message_id);
        const ultimo = await guardarReplyMensajeEnviado(telefono, user.uid, { emisor, fecha, leido, mensaje, tipo, mensajeId, context:{message_id}});
        callback(ultimo,telefono);
      } else {
        mensajeId = await SendMessageWhatsApp(mensaje, telefono);
        const ultimo = await guardarMensajeEnviado(telefono, user.uid, { emisor, fecha, leido, mensaje, tipo, mensajeId });
        callback(ultimo,telefono);
      };
      socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(user.uid));
      
    } catch (error) {
      console.log(error);
    };
  });

  socket.on('liberar-paciente', async (data, callback) => {
    const { telefono, pacienteUid, userUid } = data;
    const pacienteSinAsignar = await quitarUsuario(telefono, pacienteUid);
    if (pacienteSinAsignar.err) {
      callback(pacienteSinAsignar.err);
      return;
    };
    const agregarSinAsignar = await agregarDesdePaciente(pacienteSinAsignar.paciente);
    if (!agregarSinAsignar.ok) {
      callback(agregarSinAsignar.err);
      return;
    }
    callback(agregarSinAsignar);
    io.to(userUid).emit('mis-mensajes', await obtenerPacientesPorUsuario(userUid));
    io.emit('mensajes-sinAsignar', await obtenerPendientes());
  });

  socket.on('reasignar-paciente', async (data, callback) => {
    const { pacienteUid, telefono, nuevoUsuario, anteriorUsuario } = data;
    if (!anteriorUsuario || anteriorUsuario.nombre === '' || anteriorUsuario.email === '' || anteriorUsuario.uid === '') {
      const reasignar = await reasignarPaciente(telefono, nuevoUsuario, null, pacienteUid);
      if (reasignar.ok) {
        io.to(nuevoUsuario.uid).emit('mis-mensajes', await obtenerPacientesPorUsuario(nuevoUsuario.uid));
        io.emit('mensajes-sinAsignar', await obtenerPendientes());
        callback(reasignar);
        return;
      };
    };
    const reasignar = await reasignarPaciente(telefono, nuevoUsuario, anteriorUsuario, pacienteUid);
    if (reasignar.ok) {
      io.to(anteriorUsuario.uid).emit('mis-mensajes', await obtenerPacientesPorUsuario(anteriorUsuario.uid));
      io.to(nuevoUsuario.uid).emit('mis-mensajes', await obtenerPacientesPorUsuario(nuevoUsuario.uid));
      callback(reasignar);
      return;
    };
    callback({ err: 'No se pudo reasignar el paciente' });
  });

  socket.on('cambiar-estado', async (data, callback) => {
    const res = await actulizarEstado(data.uid, data.activo);
    callback(res);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', user.nombre);
  });
});

server.listen(PORT, () => {
  console.log('Servidor corriendo en el puerto: ', PORT);
});