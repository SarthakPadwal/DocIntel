const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  // Min 6 chars, at least 1 number
  const re = /^(?=.*\d).{6,}$/;
  return re.test(password);
};

const validateRequired = (fields) => {
  for (const field of fields) {
    if (field.value === undefined || field.value === null || String(field.value).trim() === '') {
      return field.name;
    }
  }
  return null;
};

const validateFileType = (mimetype) => {
  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/tiff',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return allowedTypes.includes(mimetype);
};

const validateFileSize = (size) => {
  const maxSize = 25 * 1024 * 1024; // 25MB
  return size <= maxSize;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRequired,
  validateFileType,
  validateFileSize
};
