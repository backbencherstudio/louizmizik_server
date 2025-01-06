const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the path for the uploads directory
const uploadDir = path.join(process.cwd(), 'uploads/images');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique file name
  },
});

const upload = multer({
    
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    console.log("lalalaalala")
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and JPEG are allowed."));
    }
  },
});

// Export upload.single for use in routes
module.exports = upload.single('avatar');
