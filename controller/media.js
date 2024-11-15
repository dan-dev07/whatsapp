const express = require("express");
const multer = require('multer');
const { descargarArchivo } = require("../helpers/manejoArchivosPacientes/azureDb");
const { cargarArchivo } = require("../helpers/manejoArchivosEscotel/azureDb");
const { SetFileWhatsApp, SendImageWhatsApp, SendDocumentWhatsApp } = require("./whatsapp");
const { SampleImage, SampleDocument } = require("../helpers/textTypes");
const { guardarArchivoEnviado } = require("./paciente");


const entregarArchivoBuffer = async (req, res = express.response) => {
  try {
    const { urlDocumento, tipo, telefono } = req.body;

    if (tipo === 'image' || tipo === 'document') {
      const bufferStream = await descargarArchivo(urlDocumento);
      if (bufferStream) {
        // Almacenar los datos en un buffer
        const chunks = [];
        bufferStream.on('data', (chunk) => {
          chunks.push(chunk);
        });

        bufferStream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString('base64');
          if (tipo === 'image') {
            const dataUrl = `data:image/jpeg;base64,${base64}`; // Cambia 'image/jpeg' si es necesario
            res.json({ image: dataUrl });
          };
          if (tipo === 'document') {
            const dataUrl = `${base64}`; // Tipo MIME para PDF
            res.json({ document: dataUrl });
          }
        });

        bufferStream.on('error', (error) => {
          console.error('Error processing stream:', error);
          res.status(500).send('Error processing image stream');
        });
      };
    };

  } catch (error) {
    res.status(500).json({
      response: 'Hubo un error al regresar la descarga'
    });
  }
};

// Configura multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'controller/uploads'); // Asegúrate de que esta carpeta exista
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },

});
const upload = multer({ storage });

const subirArchivo = async (req, res = express.response) => {
  try {
    const {filename, mimetype, path } = req.file;
    const {telefono, uidUser} = req.body;
    const extensiones = ['pdf', 'docx', 'pptx', 'xlsx', 'txt', 'zip', '7zip','doc', 'ppt', 'xls'];
    const ext = filename.split('.').reverse()[0];    
    const {id} = await SetFileWhatsApp(filename, mimetype, telefono, path);
    const rutaBlobname = await cargarArchivo(filename, mimetype, telefono);
    
    if (mimetype.includes("image")) {
      const data = SampleImage(telefono, id);
      req.io.to(uidUser).emit('archivo-enviado', await guardarArchivoEnviado(telefono, uidUser, rutaBlobname, 'image'));
      await SendImageWhatsApp(data);
    }else {
      const data = SampleDocument(telefono, id, filename);
      req.io.to(uidUser).emit('archivo-enviado', await guardarArchivoEnviado(telefono, uidUser, rutaBlobname, 'document', filename));
      await SendDocumentWhatsApp(data);
    };    
    res.send('Archivo recibido');   
  } catch (error) {
    res.status(500).json({
      response: 'Hubo un error al regresar la descarga'
    });
  }
};


module.exports = {
  entregarArchivoBuffer,
  subirArchivo,
  upload,
}