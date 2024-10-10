const { BlobServiceClient, StorageSharedKeyCredential, newPipeline } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { MensajeError } = require('./error');

// Configura tu conexión a Azure Blob Storage
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_CONNECTION_STRING;

// Nombre del contenedor y del blob
const containerName = 'data';

const cargarArchivo =async(buffer, telefono, id, tipo)=>{
  try {
    let blobName;
    if (tipo === 'image') {
      blobName = `${telefono}/${id}.jpg`;
    }else if (tipo === 'document') {
      blobName = `${telefono}/${id}.pdf`;
    };
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
    console.log(`El archivo se ha subido a ${blobName} en el contenedor ${containerName}`);
    return blobName;
    
  } catch (error) {
    return MensajeError('Error al cargar el blob:', error);
  }
}

module.exports = {
  cargarArchivo,
}