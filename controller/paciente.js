const Paciente = require('../models/paciente');
// const sinAsignar = require('../models/sinAsignar');
const SinAsignar = require('../models/sinAsignar');
const { v4: uuidv4 } = require('uuid');

const agregarPaciente = async (datos) => {
  try {
    const { nombrePaciente = 'Pruebas', telefono, mensaje, fecha, emisor, nombre, email, id, ultimaComunicacion,  leido} = datos;

    const chats = {fecha, mensaje, leido, emisor};
    const user = {nombre, email};

    const paciente = await Paciente({ nombrePaciente ,telefono, usuarioAsignado:user, ultimaComunicacion, chats:chats });
    await SinAsignar.findOneAndDelete({telefono, mensaje});

    paciente.save();
    return ({
      paciente
    });
  } catch (error) {
    console.log(error)
    return 'No se pudo guardar el paciente';
  };
};

const obtenerPacientesPorUsuario = async (email) => {
  try {
    const pacientesPorUsuario = (await Paciente.find({'usuarioAsignado.email':email})).map(p =>{
      const {telefono, chats, id} = p;
      const ultimoMsg = chats[chats.length - 1];
      const {fecha, mensaje, leido} = ultimoMsg;
      return {telefono, fecha, mensaje, id, leido};
    });
    return pacientesPorUsuario.sort((a, b) => a.leido - b.leido );
  } catch (error) {
    console.log(error)
    return 'No se pudo obtener a los pacientes para el usuario';
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
    return 'No se pudo guardar el mensaje';
  }
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
    return 'No se pudo cargar las conversaciones';
  }
}

const ultimoMensaje = async()=>{
  try {
    const paciente = await Paciente.find({'usuarioAsignado.email':email})
    if (paciente.length === 0) {
      return [];
    }
    const arrayChat = [...paciente.chats];
    const ultimoMensaje = arrayChat[arrayChat.length -1];

    console.log(ultimoMensaje);
  } catch (error) {
    console.log(error);
  };
};

const buscarNumeroExistente = async (telefono) => {
  console.log(telefono);
  const numeroExistente = await Paciente.findOne({telefono});
  console.log('numeroExistente: ', numeroExistente);
  if (numeroExistente === null) {
    return false;
  };
  return true;
}
module.exports = {
  agregarPaciente,
  obtenerPacientesPorUsuario,
  guardarMensajeEnviado,
  obtenerConversacionActual,
  buscarNumeroExistente,
}