const { Schema, model } = require('mongoose');

const PacienteSchema = new Schema({
  nombrePaciente: {
    type: String,
    required: false,
    trim: true
  },
  telefono: {
    type: String,
    required: false,
  },
  usuarioAsignado: {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true
    },
    id:{
      type: String,
      required: true
    }
  },
  ultimaComunicacion: {
    type: Date,
    required: false,
  },
  chats:
    [{
      fecha: {
        type: String,
        required: false,
      },
      mensaje: {
        type: String,
        required: false,
      },
      leido: {
        type: Boolean,
        required: false,
        default: false,
      },
      emisor: {
        type: String,
        required: false,
      }
    }],
  fecha: {
    type: String,
    required: false,
  },
  mensaje: {
    type: String,
    required: false,
  },
});

PacienteSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
module.exports = model('Paciente', PacienteSchema); 