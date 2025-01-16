require('dotenv').config();
const { BlobServiceClient } = require('@azure/storage-blob');
const { MensajeError } = require('../error');
const stream = require('stream');

// Configura tu conexión a Azure Blob Storage
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_CONNECTION_STRING;

// Nombre del contenedor y del blob
const containerName = 'data';

const cargarArchivo =async(buffer, telefono, id, tipo, filename)=>{
  // console.log(buffer, telefono, id, tipo, filename);
  try {
    let blobName;
    if (tipo === 'image') {
      blobName = `${telefono}/${id}.jpg`;
    }else if (tipo === 'document') {
      blobName = `${telefono}/${filename}`;
    }else if(tipo === 'audio'){
      blobName = `${telefono}/${id}.wav`
    }else if (tipo === 'video') {
      blobName = `${telefono}/${id}.mp4`
    }
    // Crear un cliente de servicio de blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  
    // Obtener un cliente de contenedor
    const containerClient = blobServiceClient.getContainerClient(containerName);
  
    // Crear el contenedor si no existe
    await containerClient.createIfNotExists();
  
    // Obtener un cliente de blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    // Subir el blob
    await blockBlobClient.uploadData(buffer);
    // console.log(`El archivo se ha subido a ${blobName} en el contenedor ${containerName}`);
    return blobName;
    
  } catch (error) {
    return MensajeError('Error al cargar el blob:', error);
  };
};

const descargarArchivo = async (blobName) => {
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
  cargarArchivo,
  descargarArchivo,
}