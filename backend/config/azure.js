const { BlobServiceClient } = require("@azure/storage-blob");

// Get your connection string from the Azure Portal
const azureUrl = process.env.AZURE_URL;

if (!azureUrl) {
  throw new Error("AZURE_URL environment variable is not set");
}

const blobServiceClient = new BlobServiceClient(azureUrl);

// Get container client for images
const containerName = "images";
const containerClient = blobServiceClient.getContainerClient(containerName);

// Upload the file
async function uploadProfilePic(userId, fileBuffer, fileName, mimeType) {
  try {
    const blobName = `profile-pictures/${userId}_${Date.now()}_${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: mimeType,
        blobCacheControl: "public, max-age=31536000", // Cache for 1 year
      },
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading to Azure:", error);
    throw new Error("Failed to upload image to Azure Blob Storage");
  }
}

module.exports = {
  uploadProfilePic,
};
