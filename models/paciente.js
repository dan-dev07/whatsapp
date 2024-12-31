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
    unique: true
  },
  uid: {
    type: String,
    require: true,
    unique: true
  },
  usuarioAsignado: {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    uid: {
      type: String,
      required: true,
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
        required: true
      },
      emisor: {
        type: String,
        required: true,
      },
      tipo: {
        type: String,
        required: true
      },
      urlDocumento: {
        type: String,
        required: false,
      },
      filename: {
        type: String,
        required: false
      },
      mensaje: {
        type: String,
        required: true,
        trim: true
      },
      mensajeId: {
        type: String,
        required: true,
        trim: true
      },
      leido: {
        type: Boolean,
        required: false
      },
    }]
});

PacienteSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
module.exports = model('Paciente', PacienteSchema); 