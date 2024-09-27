const Paciente = require('../models/paciente');
const SinAsignar = require('../models/sinAsignar');
const dayjs = require('dayjs');

const obtenerPendientes = async () => {
  try {
    const mensajes = await SinAsignar.find();
    // console.log('obtenerPendientes: ', mensajes)
    if (mensajes.length === 0) {
      return [];
    };
    const ultimoMensajeArray = mensajes.map(m => {
      const { mensaje, telefono, fecha, id } = m;
      const ultimo = mensaje[mensaje.length - 1];
      return {
        telefono,
        mensaje: ultimo,
        fecha,
        id
      }
    });
    return {
      mensajes: ultimoMensajeArray
    };

  } catch (error) {
    console.log(error);
    return {
      response: 'No se obtuvieron los datos correctamente'
    };
  }
};

const agregarPendientes = async (mensaje, telefono) => {
  try {
    const fecha = dayjs().format('DD/MM/YYYY HH:mm a');
    // buscar en pendientes y actualizar
    const mensajePaciente = await SinAsignar.findOne({ telefono });
    if (!mensajePaciente) {
      //guardar mensaje
      const agregarMensaje = await SinAsignar.create({telefono, mensaje, fecha});
      console.log('Pendiente guardado: ', agregarMensaje);

      return true;

    }else if(mensajePaciente){
      const res = await SinAsignar.findOneAndUpdate({ telefono },
        { $push: { mensaje: mensaje }, fecha },
        { new: true }
      );
      console.log('Pendiente actualizado');
      return true;
    }else{
      return false;
    }
  } catch (error) {
    console.log(error);
    return 'No se guardó el mensaje';
  };
};

// const agregarPendientes = async (mensaje, telefono) => {
//   try {
//     const fecha = dayjs().format('DD/MM/YYYY HH:mm a');

//     //buscar en pendientes 

//     //guardar mensaje
//     const agregarMensaje = await SinAsignar({ telefono, mensaje, fecha });
//     agregarMensaje.save();
//     console.log('Mensaje enviado');
//     return ({
//       mensaje: agregarMensaje
//     });
//   } catch (error) {
//     console.log(error)
//     return ({
//       mensaje: 'No se pudo guardar el mensaje'
//     });
//   };
// };

const agregarNuevoPendiente = async (mensaje, telefono) => {
  try {
    const fecha = dayjs().format('DD/MM/YYYY HH:mm a');

    //guardar mensaje
    const agregarMensaje = await SinAsignar({ telefono, mensaje, fecha });
    agregarMensaje.save();
    console.log('Mensaje enviado: NuevoPendiente');
    return ({
      mensaje: agregarMensaje
    });
  } catch (error) {
    console.log(error)
    return ({
      mensaje: 'No se pudo guardar el mensaje'
    });
  };
}

const agregarNuevoMensajePendiente = async (mensaje, telefono) => {
  try {
    const fecha = dayjs().format('DD/MM/YYYY HH:mm a');
    // buscar en pendientes y actualizar
    const res = await SinAsignar.findOneAndUpdate({ telefono },
      { $push: { mensaje: mensaje }, fecha },
      { new: true }
    );
    console.log('Mensaje enviado: agregarNuevoMensajePendiente')
    return ({
      mensaje: res
    });
  } catch (error) {
    console.log(error)
    return ({
      mensaje: 'No se pudo guardar el mensaje'
    });
  };
}
module.exports = {
  obtenerPendientes,
  agregarPendientes,
  agregarNuevoMensajePendiente,
  agregarNuevoPendiente,
}

// const agregarPendientes = async(mensaje, telefono) => {
//   try {
//     const fecha = dayjs().format('DD/MM/YYYY HH:mm a');

//     //buscar en pendientes

//     //guardar mensaje
//     const agregarMensaje = await SinAsignar({telefono, mensaje, fecha});
//     agregarMensaje.save();
//     console.log('Mensaje enviado');
//     return ({
//       mensaje: agregarMensaje
//     });
//   } catch (error) {
//     console.log(error)
//     return ({
//       mensaje: 'No se pudo guardar el mensaje'
//     });
//   };
// };