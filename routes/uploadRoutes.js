const express = require("express");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const router = express.Router();

const upload = require("../middlewares/uploadFileMw");

// Helper function to determine file type
const getFileType = (mimeType) => {
  if (mimeType.startsWith("image/")) {
    return "image";
  } else if (mimeType.startsWith("video/")) {
    return "video";
  } else {
    return "document";
  }
};

router.post("/", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err });
    } else {
      if (req.file == undefined) {
        res.status(400).json({ error: "No file selected!" });
      } else {
        res.status(200).json({
          message: "File uploaded successfully!",
          file: `uploads/${req.file.filename}`,
        });
      }
    }
  });
});

// Get file by name
router.get("/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../uploads", filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }

    res.sendFile(filePath);
  });
});


// Get file details by name
router.get('/details/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    const mimeType = mime.lookup(filePath);
    const fileType = getFileType(mimeType);

    // Construct URL path
    const urlPath = `${req.protocol}://${req.get('host')}/api/upload/${filename}`;

    const fileDetails = {
      filename,
      path: urlPath,
      mimeType,
      fileType
    };

    res.json(fileDetails);
  });
});

// Get all files
router.get('/', (req, res) => {
  const directoryPath = path.join(__dirname, '../uploads');

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan files' });
    }

    const fileDetails = files.map(file => {
      const filePath = path.join(directoryPath, file);
      const mimeType = mime.lookup(filePath);
      const fileType = getFileType(mimeType);

    // Construct URL path
    const urlPath = `${req.protocol}://${req.get('host')}/api/upload/${file}`;

      return {
        filename: file,
        path: urlPath,
        mimeType,
        fileType
      };
    });

    res.json({ files: fileDetails });
  });
});


module.exports = router;
