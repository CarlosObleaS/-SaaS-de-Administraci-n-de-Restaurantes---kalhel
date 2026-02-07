const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Carpeta absoluta donde se guardarán las imágenes del menú
const uploadDir = path.join(__dirname, "..", "..", "uploads", "menu");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegurar que la carpeta exista para evitar ENOENT
    fs.mkdir(uploadDir, { recursive: true }, (err) => {
      if (err) return cb(err, uploadDir);
      cb(null, uploadDir);
    });
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo imágenes"));
    }
    cb(null, true);
  },
});

module.exports = upload;

