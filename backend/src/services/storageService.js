const fs = require('fs/promises');
const path = require('path');

const saveFile = async (file) => {
  // Multer already saves it, we just return info for abstraction
  return {
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size
  };
};

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error.message);
    return false;
  }
};

const getFilePath = (storedFilename) => {
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  return path.join(process.cwd(), uploadDir, storedFilename);
};

module.exports = {
  saveFile,
  deleteFile,
  getFilePath
};
