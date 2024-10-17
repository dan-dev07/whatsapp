const Paciente = require('../models/paciente');
const SinAsignar = require('../models/sinAsignar');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');

const agregarPaciente = async (datos) => {
  try {
    const { nombrePaciente = 'Pruebas', telefono, nombre, email, id, ultimaComunicacion } = datos;

    const user = {nombre, email, id};
    const pendiente = await SinAsignar.findOne({telefono});
    const chats = pendiente.mensajes;
    const paciente = await Paciente.create({ nombrePaciente ,telefono, usuarioAsignado:user, ultimaComunicacion, chats:chats });
    await SinAsignar.findOneAndDelete({telefono});
    
    return ({
      paciente
    });
  } catch (error) {
    console.log(error)
    return {err:'No se pudo guardar el paciente'};
  };
};

const obtenerPacientesPorUsuario = async (email) => {
  try {
    const pacientesPorUsuario = (await Paciente.find({'usuarioAsignado.email':email})).map(p =>{
      const {nombrePaciente, telefono, chats, id} = p;
      const ultimoMsg = chats[chats.length - 1];
      const {fecha, mensaje, leido } = ultimoMsg;
      return {nombrePaciente, telefono, id, fecha, mensaje, leido};
    });
    return pacientesPorUsuario.sort((a, b) => a.leido - b.leido );
  } catch (error) {
    console.log(error)
    return {err:'No se pudo obtener a los pacientes para el usuario'}
  };
};

const guardarMensajeEnviado =async (telefono,email, mensaje)=>{  
  try {
    const paciente = await Paciente.findOneAndUpdate(
      {telefono, 'usuarioAsignado.email':email},
      { $push: { chats:mensaje } },
      {new:true});
    const ultimo = paciente.chats[paciente.chats.length -1];
    return ultimo;
  } catch (error) {
    console.log(error);
    return {err:'No se pudo obtener guardar el mensaje'};
  };
};

const guardarArchivoEnviado = async(telefono, email, urlDocumento, tipo)=>{
  try {
    const fecha = dayjs().format('DD/MM/YYYY HH:mm a');
    const mensaje = { 
      fecha, 
      emisor: 'Escotel',
      tipo,
      urlDocumento,
      mensaje:"Imagen enviado", 
      leido:false, 
    }
    const paciente = await Paciente.findOneAndUpdate(
      {telefono, 'usuarioAsignado.email':email},
      { $push: { chats:mensaje } },
      {new:true});
    const ultimo = paciente.chats[paciente.chats.length -1];
    return ultimo;
  } catch (error) {
    console.log(error);
    return {err:'No se pudo obtener guardar el mensaje'};
  };
}


const obtenerConversacionActual =async (telefono, email)=>{
  try {
    const pacienteActual = await Paciente.findOne({telefono, 'usuarioAsignado.email': email});
    
    const {chats} = pacienteActual;
    const mensajesLeidos = chats.map(c =>{
      if (c.emisor === 'Paciente') {
        c.leido = true;
      };
      return c;
    });
    const pacienteActualizado = await Paciente.findOneAndUpdate({telefono, 'usuarioAsignado.email': email}, {chats:mensajesLeidos}, {new:true});
    const {chats:chatsAct} = pacienteActualizado;
    
    return chatsAct;
  } catch (error) {
    console.log(error);
    return {err:'No se pudo cargar las conversaciones'};
  }
}

const buscarNumeroExistente = async (telefono) => {
  try {
    const numeroExistente = await Paciente.findOne({telefono});
    // console.log('numeroExistente: ', numeroExistente);
    if (!numeroExistente) {
      return {
        ok:false,
      };
    };
    return {
      ok:true,
      usuarioAsignado: numeroExistente.usuarioAsignado,
    };
  } catch (error) {
    console.log(error);
    return {err: 'Error al encontrar el numero en pendientes y en pacientes' };
  }
};

module.exports = {
  agregarPaciente,
  obtenerPacientesPorUsuario,
  guardarMensajeEnviado,
  guardarArchivoEnviado,
  obtenerConversacionActual,
  buscarNumeroExistente,
}