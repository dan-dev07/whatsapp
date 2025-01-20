const { Schema, model } = require('mongoose');

const SinAsignarSchema = Schema({
  datosPaciente:{
    nombre:{
      type:String,
      required:false,
      trim:true
    },
    apellido:{
      type:String,
      required:false,
      trim:true
    },
    empresa:{
      type:String,
      required:false,
      trim:true
    },
  },
  telefono: {
    type:String,
    required:true,
    unique:true,
  },
  uid:{
    type:String,
    require:true,
    unique:true,
  },
  mensajes: [{
    fecha:{
      type:String,
      required:true
    },
    emisor:{
      type:String,
      required:true,
    },
    tipo:{
      type:String,
      required:true
    },
    urlDocumento:{
      type:String,
      required:false,
    },
    filename:{
      type:String,
      required:false,
    },
    mensaje:{
      type:String,
      required:true,
      trim:true
    },
    mensajeId:{
      type:String,
      required:true,
      trim:true
    },
    caption:{
      type:String,
      required:false,
      trim:true
    },
    context:{
      message_id:{
        type:String,
        required:false,
        trim:true
      },
      from:{
        type:String,
        required:false,
        trim:true,
      },
      id:{
        type:String,
        required:false,
        trim:true
      }
    },
  }]
});

SinAsignarSchema.method('toJSON', function () {
  const {__v, _id,...object} = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Pendiente', SinAsignarSchema); 