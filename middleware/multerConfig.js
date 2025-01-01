const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('audio')) {
      cb(null, 'uploads/audio/');
    } else if (file.mimetype.startsWith('image')) {
      cb(null, 'uploads/images/');
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

module.exports = upload;