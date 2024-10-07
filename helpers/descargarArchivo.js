const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

// Configura tu conexión a Azure Blob Storage
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_CONNECTION_STRING;

async function downloadBlobImagen(id) {
  // Nombre del contenedor y del blob
  const containerName = 'documentos';
  const blobName = 'devalmacena';

  try {
    // Crear un cliente de servicio de blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Obtener un cliente de contenedor
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Obtener un cliente de blob
    const blockBlobClient = containerClient.listBlobsFlat(blobName);

    // Iterar sobre los blobs y mostrarlos
    for await (const blob of blockBlobClient) {
      console.log(`- ${blob.name}`);
    };
  } catch (error) {
    console.error('Error al descargar el blob:', error);
  }
};

async function downloadBlobPdf(id) {
  // Nombre del contenedor y del blob
  const containerName = 'documentos';
  const blobName = 'devalmacena';
  
  try {
    // Crear un cliente de servicio de blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Obtener un cliente de contenedor
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Obtener un cliente de blob
    const blockBlobClient = containerClient.listBlobsFlat(blobName);

    // Iterar sobre los blobs y mostrarlos
    for await (const blob of blockBlobClient) {
      console.log(`- ${blob.name}`);
    };
  } catch (error) {
    console.error('Error al descargar el blob:', error);
  }
};

module.exports = {
  downloadBlobImagen,
  downloadBlobPdf,
}