const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { MensajeError } = require('./error');

// Configura tu conexión a Azure Blob Storage
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_CONNECTION_STRING;
const containerName = 'data';

const downloadBlobImagen= async (blobName) => {
  // Nombre del contenedor y del blob
  // const blobName = `${telefono}/${id}.jpg`;
  const [telefono, id] = blobName.split("/")
  

  try {
    // Crear un cliente de servicio de blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Obtener un cliente de contenedor
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Obtener un cliente de blob
    const blockBlobClient = containerClient.getBlobClient(blobName);

    // Descargar el blob
    const downloadBlockBlobResponse = await blockBlobClient.download(0);

    // Crear un stream de escritura para el archivo
    // const origen = path.join(__dirname, 'descarga');
    // const imagenRuta = `${origen}/${id}`;
    // const writeStream = fs.createWriteStream(imagenRuta);

    // Pipe el stream de lectura del blob al stream de escritura
    const bufferStream = new stream.PassThrough();
    return downloadBlockBlobResponse.readableStreamBody.pipe(bufferStream);
  } catch (error) {
    return MensajeError('Error al descargar el blob:', error);
  }
};

const downloadBlobPdf= async (blobName) => {
  // Nombre del contenedor y del blob
  // const blobName = `${telefono}/${id}.pdf`;
  console.log(blobName);
  const [telefono, id] = blobName.split("/")

  try {
    // Crear un cliente de servicio de blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Obtener un cliente de contenedor
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Obtener un cliente de blob
    const blockBlobClient = containerClient.getBlobClient(blobName);

    // Descargar el blob
    const downloadBlockBlobResponse = await blockBlobClient.download(0);

    // Pipe el stream de lectura del blob al stream de escritura
    const bufferStream = new stream.PassThrough();
    return downloadBlockBlobResponse.readableStreamBody.pipe(bufferStream);
  } catch (error) {
    return MensajeError('Error al descargar el blob:', error);
  };
};

module.exports = {
  downloadBlobImagen,
  downloadBlobPdf,
}