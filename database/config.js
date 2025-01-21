const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConnection = async ()=>{
  try {
    await mongoose.connect(process.env.DB_CNN);
    console.log('DB conectada');
  } catch (error) {
    console.log('No se pudo conectar a la DB',error);
  }
};

module.exports = {
  dbConnection
}