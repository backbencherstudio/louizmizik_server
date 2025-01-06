// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (file.mimetype.startsWith('audio')) {
//       cb(null, 'uploads/audio/');
//     } else if (file.mimetype.startsWith('image')) {
//       cb(null, 'uploads/images/');
//     } else {
//       cb(new Error('Invalid file type'), null);
//     }
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure that the directories exist
const ensureDirectoriesExist = () => {
  const audioDir = 'uploads/audio/';
  const imageDir = 'uploads/images/';
  
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }
};

// Call the function to ensure directories exist
ensureDirectoriesExist();

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
