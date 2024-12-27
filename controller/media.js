const express = require("express");
const multer = require('multer');
const { descargarArchivo } = require("../helpers/manejoArchivosPacientes/azureDb");
const { cargarArchivo } = require("../helpers/manejoArchivosEscotel/azureDb");
const { SetFileWhatsApp, SendFileWhatsApp } = require("./whatsapp");
const { SampleImage, SampleDocument, SampleAudio } = require("../helpers/textTypes");
const { guardarArchivoEnviado } = require("./paciente");
const { isPipelineLike } = require("@azure/storage-blob");


const entregarArchivoBuffer = async (req, res = express.response) => {
  try {
    const { urlDocumento, tipo, telefono } = req.body;

    if (tipo === 'image' || tipo === 'document' || tipo === 'audio' || tipo === 'video') {
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
            res.json({ file: dataUrl });
          };
          if (tipo === 'document') {
            const dataUrl = `${base64}`; // Tipo MIME para PDF
            res.json({ file: dataUrl });
          };
          if (tipo === 'audio') {
            const dataUrl = `data:audio/wav;base64,${base64}`; // Cambia 'image/jpeg' si es necesario
            res.json({ file: dataUrl });
          }
          if (tipo === 'video') {
            const dataUrl = `data:video/mp4;base64,${base64}`; // Cambia 'image/jpeg' si es necesario
            res.json({ file: dataUrl });
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

const enviarArchivo = async (req, uidUser, data, telefono, rutaBlobname, text, filename) => {
  try {
    const res = await guardarArchivoEnviado(telefono, uidUser, rutaBlobname, text, filename)
    if (res.ok) {
      //si el archivo se guarda correctamente, enviar el mensaje 
      req.io.to(uidUser).emit('archivo-enviado', res.ultimo);
      await SendFileWhatsApp(data);
    };
  } catch (error) {
    console.log(error);
  };
};

const subirArchivo = async (req, res = express.response) => {
  try {
    const { filename, mimetype, path } = req.file;
    const { telefono, uidUser } = req.body;
    const { id } = await SetFileWhatsApp(filename, mimetype, telefono, path);
    const rutaBlobname = await cargarArchivo(filename, mimetype, telefono);

    if (mimetype.includes("image")) {
      const data = SampleImage(telefono, id);
      enviarArchivo(req, uidUser, data, telefono, rutaBlobname, 'image');
    } else {
      const data = SampleDocument(telefono, id, filename);
      enviarArchivo(req, uidUser, data, telefono, rutaBlobname, 'document', filename);
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