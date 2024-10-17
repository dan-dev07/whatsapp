const mongoose = require('mongoose');
require('dotenv').config();

const dbConnection = async ()=>{
  try {
    await mongoose.connect(process.env.DB_CNN); 
    console.log('DB conectada');
  } catch (error) {
    console.log(error);
    throw new Error('No se pudo conectar a la BD con mongo');
  };
};

module.exports = {
  dbConnection
}