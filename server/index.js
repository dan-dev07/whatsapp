//Servidor Express
const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config');
const socketio = require('socket.io');
const { comprobarJWT } = require('../helpers/jwt');
const { obtenerPendientes, agregarPendiente, agregarDesdePaciente } = require('../controller/sinAsignar');
const { obtenerPacientesPorUsuario, agregarPaciente, obtenerConversacionActual, guardarMensajeEnviado, quitarUsuario, reasignarPaciente } = require('../controller/paciente');
const { SendMessageWhatsApp } = require('../controller/whatsapp');
const { actulizarEstado } = require('../controller/usuario');


const app = express();
const PORT = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = socketio(server, {
  cors: {
    origin: ['http://localhost:5173', '172.30.96.1:5173', '192.168.16.78:5173', 'https://stupendous-tarsier-6726ab.netlify.app/'],
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
app.use('/api/Usuarios', require('../router/usuarios'));
app.use('/api/whatsapp', require('../router/whatsapp'));
app.use('/api/datos', require('../router/datos'));

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
  socket.on('paciente-asignado', async (datos) => {
    await agregarPaciente(datos);
    io.emit('mensajes-sinAsignar', await obtenerPendientes());
    io.to(datos.id).emit('mis-mensajes', await obtenerPacientesPorUsuario(datos.email));
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

  socket.on('liberar-paciente', async ({ telefono, email }) => {
    const pacienteSinAsignar = await quitarUsuario(telefono);
    if (!pacienteSinAsignar.ok) {
      return pacienteSinAsignar.err;
    };
    const agregarSinAsignar = await agregarDesdePaciente(pacienteSinAsignar.paciente);
    if (!agregarSinAsignar.ok) {
      return pacienteSinAsignar.err;
    };
    socket.emit('mis-mensajes', await obtenerPacientesPorUsuario(email));
    io.emit('mensajes-sinAsignar', await obtenerPendientes());
    io.emit('actualizar-ventana', {
      todosLosMensajes: true
    })
  });

  socket.on('liberar-paciente-por-supervisor', async (data, callback) => {
    console.log(data);
    const { email, telefono, id } = data;
    const pacienteSinAsignar = await quitarUsuario(telefono);
    if (!pacienteSinAsignar.ok) {
      return false;
    };
    const agregarSinAsignar = await agregarDesdePaciente(pacienteSinAsignar.paciente);
    io.to(id).emit('mis-mensajes', await obtenerPacientesPorUsuario(email));
    io.emit('mensajes-sinAsignar', await obtenerPendientes());
    callback(agregarSinAsignar);
  });

  socket.on('reasignar-paciente', async (data) => {
    console.log(data);
    const { telefono, nuevoUsuario, anteriorUsuario } = data;
    const reasignar = await reasignarPaciente(telefono, nuevoUsuario, anteriorUsuario);
    if (reasignar.ok) {
      io.to(anteriorUsuario.id).emit('mis-mensajes', await obtenerPacientesPorUsuario(anteriorUsuario.email));
      io.to(nuevoUsuario.id).emit('mis-mensajes', await obtenerPacientesPorUsuario(nuevoUsuario.email));
      
    };
  });

  socket.on('reasignar-paciente-por-supervisor', async (data) => {
    console.log(data);
    const { telefono, nuevoUsuario, anteriorUsuario } = data;
    if (anteriorUsuario.nombre === '' ||
      anteriorUsuario.email === '' ||
      anteriorUsuario.id === '') {
      const reasignar = await reasignarPaciente(telefono, nuevoUsuario);
      io.to(nuevoUsuario.id).emit('mis-mensajes', await obtenerPacientesPorUsuario(nuevoUsuario.email));
      io.emit('mensajes-sinAsignar', await obtenerPendientes());
      io.emit('actualizar-ventana', {
        todosLosMensajes: true
      })
    }
    const reasignar = await reasignarPaciente(telefono, nuevoUsuario, anteriorUsuario);
    if (reasignar.ok) {
      io.to(anteriorUsuario.id).emit('mis-mensajes', await obtenerPacientesPorUsuario(anteriorUsuario.email));
      io.to(nuevoUsuario.id).emit('mis-mensajes', await obtenerPacientesPorUsuario(nuevoUsuario.email));
      io.emit('actualizar-ventana', {
        todosLosMensajes: true
      })
    }
  });

  socket.on('cambiar-estado', async (data, callback) => {
    console.log(data);
    const res = await actulizarEstado(data.email, data.activo);
    console.log(res);
    callback(res);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log('Servidor corriendo en el puerto: ', PORT);
});