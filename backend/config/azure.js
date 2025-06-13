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

// Upload profile picture
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
    console.error("Error uploading profile picture to Azure:", error);
    throw new Error("Failed to upload profile picture to Azure Blob Storage");
  }
}

// Upload group picture
async function uploadGroupPic(groupId, fileBuffer, fileName, mimeType) {
  try {
    const blobName = `group-pictures/${groupId}_${Date.now()}_${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: mimeType,
        blobCacheControl: "public, max-age=31536000", // Cache for 1 year
      },
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading group picture to Azure:", error);
    throw new Error("Failed to upload group picture to Azure Blob Storage");
  }
}

// Delete the file from Azure Blob Storage
async function deleteProfilePic(photoUrl) {
  try {
    console.log(`🗑️ Attempting to delete photo: ${photoUrl}`);

    // Extract blob name from URL
    // Example URL: https://chatbotstorageimages.blob.core.windows.net/images/images/profile-pictures/userId_timestamp_filename.jpg?sas-token
    const url = new URL(photoUrl);
    let pathname = url.pathname;

    console.log(`🔍 Original pathname: ${pathname}`);

    // Remove leading slash and container name
    // pathname could be: /images/profile-pictures/... or /images/images/profile-pictures/...
    if (pathname.startsWith("/")) {
      pathname = pathname.substring(1); // Remove leading slash
    }

    // Remove container name (images/) from the beginning
    if (pathname.startsWith(`${containerName}/`)) {
      pathname = pathname.substring(containerName.length + 1);
    }

    // Handle the duplicate "images/" case
    if (pathname.startsWith(`${containerName}/`)) {
      pathname = pathname.substring(containerName.length + 1);
    }

    const blobName = pathname;
    console.log(`🔍 Final blob name: ${blobName}`);

    if (!blobName || !blobName.includes("profile-pictures/")) {
      throw new Error(
        `Invalid photo URL format. Expected profile-pictures path, got: ${blobName}`
      );
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Check if blob exists before trying to delete
    const exists = await blockBlobClient.exists();
    if (!exists) {
      console.log(`⚠️ Blob does not exist: ${blobName}`);
      return {
        success: true,
        message: "File was already deleted or does not exist",
      };
    }

    // Delete the blob
    await blockBlobClient.delete();

    console.log(`✅ Successfully deleted photo: ${blobName}`);
    return { success: true, message: "Photo deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting from Azure:", error);

    // Don't throw error if blob doesn't exist - consider it already deleted
    if (error.statusCode === 404) {
      console.log(`⚠️ Blob not found (404), considering it already deleted`);
      return { success: true, message: "File was already deleted" };
    }

    throw new Error(
      `Failed to delete image from Azure Blob Storage: ${error.message}`
    );
  }
}

// Delete group picture from Azure Blob Storage
async function deleteGroupPic(photoUrl) {
  try {
    console.log(`🗑️ Attempting to delete group photo: ${photoUrl}`);

    // Extract blob name from URL
    const url = new URL(photoUrl);
    let pathname = url.pathname;

    console.log(`🔍 Original pathname: ${pathname}`);

    // Remove leading slash and container name
    if (pathname.startsWith("/")) {
      pathname = pathname.substring(1); // Remove leading slash
    }

    // Remove container name (images/) from the beginning
    if (pathname.startsWith(`${containerName}/`)) {
      pathname = pathname.substring(containerName.length + 1);
    }

    // Handle the duplicate "images/" case
    if (pathname.startsWith(`${containerName}/`)) {
      pathname = pathname.substring(containerName.length + 1);
    }

    const blobName = pathname;
    console.log(`🔍 Final blob name: ${blobName}`);

    if (!blobName || !blobName.includes("group-pictures/")) {
      throw new Error(
        `Invalid group photo URL format. Expected group-pictures path, got: ${blobName}`
      );
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Check if blob exists before trying to delete
    const exists = await blockBlobClient.exists();
    if (!exists) {
      console.log(`⚠️ Group blob does not exist: ${blobName}`);
      return {
        success: true,
        message: "Group file was already deleted or does not exist",
      };
    }

    // Delete the blob
    await blockBlobClient.delete();

    console.log(`✅ Successfully deleted group photo: ${blobName}`);
    return { success: true, message: "Group photo deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting group photo from Azure:", error);

    // Don't throw error if blob doesn't exist - consider it already deleted
    if (error.statusCode === 404) {
      console.log(
        `⚠️ Group blob not found (404), considering it already deleted`
      );
      return { success: true, message: "Group file was already deleted" };
    }

    throw new Error(
      `Failed to delete group image from Azure Blob Storage: ${error.message}`
    );
  }
}

module.exports = {
  uploadProfilePic,
  uploadGroupPic,
  deleteProfilePic,
  deleteGroupPic,
};
