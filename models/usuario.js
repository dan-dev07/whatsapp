const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
  nombre: {
    type:String,
    required: true,
  },
  email:{
    type:String,
    required:true,
    uniquie:true
  },
  password:{
    type:String,
    required:true,
  },
  uid:{
    type:Number,
    required:true
  }
});

UsuarioSchema.method('toJSON', function () {
  const {__v, _id, password , ...object} = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Usuario', UsuarioSchema); 