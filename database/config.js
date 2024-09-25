const mongoose = require('mongoose');
// require('dotenv').config();

const dbConnection = async ()=>{
  try {
    await mongoose.connect('mongodb+srv://daniellopez:syiXemdmq1fnDkzM@cursosbackend.iq9nqyt.mongodb.net/asignacion-mensaje',{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }); 
    console.log('DB conectada');
  } catch (error) {
    console.log(error);
    throw new Error('No se pudo conectar a la BD con mongo');
  };
};

module.exports = {
  dbConnection
}