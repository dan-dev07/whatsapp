const { BlobServiceClient, StorageSharedKeyCredential, newPipeline } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { MensajeError } = require('./error');

// Configura tu conexión a Azure Blob Storage
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_CONNECTION_STRING;

// Nombre del contenedor y del blob
const containerName = 'data';

async function uploadBlobImagen(id, telefono) {

  try {
    const blobName = `${telefono}/${id}.jpg`;
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
  
    // Subir el blob
    await blockBlobClient.upload(buffer, buffer.length,{
      blobHTTPHeaders: { blobContentType: 'image/jpg' }, // Ajusta según el tipo de archivo
      onProgress: (progress) => console.log(progress),
    });
    console.log(`El archivo se ha subido a ${blobName} en el contenedor ${containerName}`);
    fs.unlinkSync(imagenRuta);
    return blobName;
    
  } catch (error) {
    return MensajeError('Error al descargar el blob:', error);
  }
};

async function uploadBlobPdf(id, telefono) {

  try {
    
    const blobName = `${telefono}/${id}.pdf`;
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
    // Leer el pdf y almacenarla en un buffer
    const buffer = fs.readFileSync(pdfRuta);
    console.log('Pdf leído correctamente');

    // Subir el blob
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: 'application/pdf' }, // Ajusta según el tipo de archivo
      onProgress: (progress) => console.log(progress),
    });
    console.log(`El archivo se ha subido a ${blobName} en el contenedor ${containerName}`);
    // fs.unlinkSync(pdfRuta);
    return blobName;
  } catch (error) {
    return MensajeError('Error al descargar el blob:', error);
  }

};

module.exports = {
  uploadBlobImagen,
  uploadBlobPdf,
}