const { Schema, model } = require('mongoose');

const SinAsignarSchema = Schema({
  telefono: {
    type:String,
    required:true
  },
  mensaje: [String],
  fecha:{
    type:String,
    required:true,
  },
  emisor:{
    type:String,
    required:false,
  }
});

SinAsignarSchema.method('toJSON', function () {
  const {__v, _id,...object} = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Pendiente', SinAsignarSchema); 