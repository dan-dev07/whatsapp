const { Schema, model } = require('mongoose');

const SinAsignarSchema = Schema({
  telefono: {
    type:String,
    required:true
  },
  mensaje: {
    type:String,
    required:true
  },
  fecha:{
    type:String,
    required:true,
  },
  emisor:{
    type:String,
    required:false,
    default:'Paciente',
  }
});

SinAsignarSchema.method('toJSON', function () {
  const {__v, _id,...object} = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Pendiente', SinAsignarSchema); 