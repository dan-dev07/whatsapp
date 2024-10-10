const express = require("express");
const fs = require('fs');
const { downloadBlobImagen, downloadBlobPdf } = require("../helpers/descargarArchivo");


const descargarImagen = async (req, res = express.response) => {
  try {
    console.log(req.body);
    const { urlDocumento, tipo, telefono } = req.body;

    if (tipo === 'image') {
      const imagen = await downloadBlobImagen(urlDocumento);
      if (imagen ) {
        res.setHeader('Content-Type', 'image/jpeg');
        imagen.pipe(res);
      };
    };
    if (tipo === 'document') {
      const pdf = await downloadBlobPdf(urlDocumento);
      if (pdf ) {
        res.setHeader('Content-Type', 'application/pdf');
        pdf.pipe(res);
      };
    };

  } catch (error) {
    res.status(500).json({
      response: 'Hubo un error al regresar la imagen descargada'
    });
  }
}

module.exports = {
  descargarImagen,
}