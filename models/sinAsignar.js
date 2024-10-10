const { Schema, model } = require('mongoose');

const SinAsignarSchema = Schema({
  telefono: {
    type:String,
    required:true,
    unique:true
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
      required:false
    },
    mensaje:{
      type:String,
      required:false,
      trim:true
    }
  }]
});

SinAsignarSchema.method('toJSON', function () {
  const {__v, _id,...object} = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Pendiente', SinAsignarSchema); 