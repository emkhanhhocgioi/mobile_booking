const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder name
 * @param {string} options.public_id - Custom public ID (optional)
 * @param {Object} options.metadata - Custom metadata (optional)
 * @returns {Promise} - Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      folder: options.folder || 'uploads',
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @param {string} resourceType - The resource type ('image', 'video', 'raw')
 * @returns {Promise} - Cloudinary deletion result
 */
const deleteFromCloudinary = (publicId, resourceType = 'image') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file objects from multer
 * @param {Object} options - Upload options
 * @returns {Promise} - Array of upload results
 */
const uploadMultipleToCloudinary = async (files, options = {}) => {
  const uploadPromises = files.map(file => 
    uploadToCloudinary(file.buffer, {
      ...options,
      public_id: options.public_id ? `${options.public_id}_${Date.now()}_${Math.random()}` : undefined
    })
  );
  
  return Promise.all(uploadPromises);
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary
};
