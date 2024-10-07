const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { MensajeError } = require('./error');

// Configura tu conexión a Azure Blob Storage
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_CONNECTION_STRING;

// Nombre del contenedor y del blob
const containerName = 'data';

async function uploadBlobImagen(id) {
  const blobName = `devalmacena`;
  // Crear un cliente de servicio de blob
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

  // Obtener un cliente de contenedor
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Crear el contenedor si no existe
  await containerClient.createIfNotExists();

  // Obtener un cliente de blob
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Verificar si el archivo existe
  const origen = path.join(__dirname, 'imagenes');
  const imagenRuta = `${origen}/${id}.jpg`;
  if (!fs.existsSync(imagenRuta)) {
    MensajeError('El archivo no existe', imagenRuta);
    return; // Salir si el archivo no existe
  };
  // Leer la imagen y almacenarla en un buffer
  const buffer = fs.readFileSync(imagenRuta);
  console.log('Imagen leída correctamente');

  // Convertir el buffer en un stream
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer); // Termina el stream con el buffer

  // Subir el blob
  await blockBlobClient.uploadStream(bufferStream, {
    blobHTTPHeaders: { blobContentType: 'image/jpg' } // Ajusta según el tipo de archivo
  });
  console.log(`El archivo se ha subido a ${blobName} en el contenedor ${containerName}`);
  fs.unlinkSync(imagenRuta);
};

async function uploadBlobPdf(id) {
  const blobName = `devalmacena`;
  // Crear un cliente de servicio de blob
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

  // Obtener un cliente de contenedor
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Crear el contenedor si no existe
  await containerClient.createIfNotExists();

  // Obtener un cliente de blob
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Verificar si el archivo existe
  const origen = path.join(__dirname, 'pdf');
  const pdfRuta = `${origen}/${id}.pdf`;
  if (!fs.existsSync(pdfRuta)) {
    MensajeError('El archivo no existe', pdfRuta);
    return; // Salir si el archivo no existe
  };
  // Leer la imagen y almacenarla en un buffer
  const buffer = fs.readFileSync(pdfRuta);
  console.log('Pdf leído correctamente');

  // Convertir el buffer en un stream
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer); // Termina el stream con el buffer

  // Subir el blob
  await blockBlobClient.uploadStream(bufferStream, {
    blobHTTPHeaders: { blobContentType: 'application/pdf' } // Ajusta según el tipo de archivo
  });
  console.log(`El archivo se ha subido a ${blobName} en el contenedor ${containerName}`);
  fs.unlinkSync(pdfRuta);
};

module.exports = {
  uploadBlobImagen,
  uploadBlobPdf,
}