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

// Common helper function to upload files
async function uploadFile(folder, id, fileBuffer, fileName, mimeType) {
  try {
    const blobName = `${folder}/${id}_${Date.now()}_${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: mimeType,
        blobCacheControl: "public, max-age=31536000", // Cache for 1 year
      },
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error(`Error uploading ${folder} to Azure:`, error);
    throw new Error(`Failed to upload ${folder} to Azure Blob Storage`);
  }
}

// Common helper function to extract blob name from URL
function extractBlobName(photoUrl, expectedFolder) {
  const url = new URL(photoUrl);
  let pathname = url.pathname;

  console.log(`🔍 Original pathname: ${pathname}`);

  // Remove leading slash
  if (pathname.startsWith("/")) {
    pathname = pathname.substring(1);
  }

  // Remove container name (images/) from the beginning - handle duplicates
  while (pathname.startsWith(`${containerName}/`)) {
    pathname = pathname.substring(containerName.length + 1);
  }

  console.log(`🔍 Final blob name: ${pathname}`);

  // Validate the expected folder
  if (!pathname || !pathname.includes(`${expectedFolder}/`)) {
    throw new Error(
      `Invalid photo URL format. Expected ${expectedFolder} path, got: ${pathname}`
    );
  }

  return pathname;
}

// Common helper function to delete files
async function deleteFile(photoUrl, expectedFolder, fileType = "file") {
  try {
    console.log(`🗑️ Attempting to delete ${fileType}: ${photoUrl}`);

    const blobName = extractBlobName(photoUrl, expectedFolder);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Check if blob exists before trying to delete
    const exists = await blockBlobClient.exists();
    if (!exists) {
      console.log(`⚠️ ${fileType} does not exist: ${blobName}`);
      return {
        success: true,
        message: `${fileType} was already deleted or does not exist`,
      };
    }

    // Delete the blob
    await blockBlobClient.delete();

    console.log(`✅ Successfully deleted ${fileType}: ${blobName}`);
    return { success: true, message: `${fileType} deleted successfully` };
  } catch (error) {
    console.error(`❌ Error deleting ${fileType} from Azure:`, error);

    // Don't throw error if blob doesn't exist - consider it already deleted
    if (error.statusCode === 404) {
      console.log(`⚠️ ${fileType} not found (404), considering it already deleted`);
      return { success: true, message: `${fileType} was already deleted` };
    }

    throw new Error(
      `Failed to delete ${fileType} from Azure Blob Storage: ${error.message}`
    );
  }
}

// Public API functions using the common helpers
async function uploadProfilePic(userId, fileBuffer, fileName, mimeType) {
  return uploadFile("profile-pictures", userId, fileBuffer, fileName, mimeType);
}

async function uploadGroupPic(groupId, fileBuffer, fileName, mimeType) {
  return uploadFile("group-pictures", groupId, fileBuffer, fileName, mimeType);
}

async function deleteProfilePic(photoUrl) {
  return deleteFile(photoUrl, "profile-pictures", "Profile picture");
}

async function deleteGroupPic(photoUrl) {
  return deleteFile(photoUrl, "group-pictures", "Group picture");
}

module.exports = {
  uploadProfilePic,
  uploadGroupPic,
  deleteProfilePic,
  deleteGroupPic,
};
