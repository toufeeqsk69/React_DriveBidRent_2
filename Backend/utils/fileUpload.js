import { cloudinary } from '../config/cloudinary.js';

/**
 * 
 * @param {string} public_id - Cloudinary public ID of the image
 */
export const deleteFromCloudinary = async (public_id) => {
  try {
    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} fileBuffer 
 * @param {string} folder 
 * @returns {Promise<Object>} 
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'drivebidrent') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto' // Auto-detect file type (image, video, pdf, etc.)
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};