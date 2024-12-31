const dayjs = require('dayjs');
const { obtenerDescarga, guardarArchivo } = require('./manejoArchivosPacientes/obtenerArchivo');

const numeroTelefono = (messages) => {
  let newNumber = '';
  const number = messages['from'];
  if (number.length === 13 && number.startsWith('521')) {
    newNumber = '52' + number.slice(3, 13);
  };
  return newNumber;
};

const rutaDescargaArchivoRecibido = async (messages) => {
  const {type:tipo, from:telefono} = messages;
  let id;
  let filename;
  if (tipo === 'image') {
    id = messages['image']['id'];
  } else if (tipo === 'document') {
    id = messages['document']['id'];
    filename = messages['document']['filename'];
  } else if (tipo === 'audio') {
    id = messages['audio']['id'];
  } else if (tipo === 'video') {
    id = messages['video']['id'];
  };

  //obtener id de archivo y guardarlo
  try {
    const descarga = await obtenerDescarga(id);
    const ruta = await guardarArchivo(descarga, telefono, id, tipo, filename);
    if (ruta.error) {
      return ruta.msg;
    };
    return {
      ruta,
      filename,
      id
    };

  } catch (error) {
    console.log('Error en descargar y guardar el archivo entrante de whatsapp', error);
  }
};

const newFecha = () => {
  // Obtener la fecha actual
  const now = new Date();
  // Configurar el formateador para la zona horaria del centro de México
  const options = {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Para usar el formato de 24 horas
  };
  // Formatear la fecha y hora
  const formatter = new Intl.DateTimeFormat('es-MX', options);
  const formattedDate = formatter.format(now);
  // console.log('Hora actual en Ciudad de México:', formattedDate);
  return formattedDate;
};

const validarPassword = value => {
  // Permitir cadena vacía o al menos 5 caracteres
  if (value === '' || value.length >= 1) {
    return true;
  };
  return false;
};

const mostrarDatosEntradaWhatsapp = (data) => {
  // Arreglo para almacenar los datos extraídos
  const result = [];

  // Extraemos los datos principales
  data.entry.forEach(entry => {
    entry.changes.forEach(change => {
      const value = change.value;

      // Datos principales de la entrada
      result.push({
        object: data.object,
        entryId: entry.id,
        messagingProduct: value.messaging_product,
        displayPhoneNumber: value.metadata.display_phoneNumber,
        phoneNumberId: value.metadata.phone_number_Id
      });

      // Extraemos los contactos
      value.contacts.forEach(contact => {
        result.push({
          contactName: contact.profile.name,
          waId: contact.wa_id
        });
      });

      // Extraemos los mensajes
      value.messages.forEach(message => {
        console.log(message);
        result.push({
          from: message.from,
          messageId: message.id,
          timestamp: dayjs(message.Timestamp).format('DD/MM/YYYY'),// Convertir timestamp a fecha
          type: message.type,
          [message.type]:[message.type].id
        });
      });
    });
  });

  // Mostrar el arreglo en consola
  // console.log(result);
};

module.exports = {
  mostrarDatosEntradaWhatsapp,
  newFecha,
  numeroTelefono,
  rutaDescargaArchivoRecibido,
  validarPassword
}