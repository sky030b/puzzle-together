const multer = require('multer');

const uploadImageMiddleware = (config) => {
  const storage = multer.memoryStorage({
    filename: (req, file, cb) => {
      const ext = file.mimetype.split('/')[1];
      cb(null, `img-${Date.now() + Math.floor(Math.random() * Date.now())}.${ext}`);
    }
  });

  const limits = { fileSize: 3000000 };
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Only accept images'), false);
    }
  };

  const upload = multer({ storage, limits, fileFilter });
  let uploads;
  if (config.single) {
    uploads = upload.single(config.fieldName);
  } else if (config.fields) {
    uploads = upload.fields(config.fields);
  }

  return (req, res, next) => {
    uploads(req, res, (err) => {
      if (err && err.message === 'Only accept images') {
        return res.status(400).send(`400 Bad Request: ${err.message}`);
      }
      if (err && err.message === 'File too large') {
        return res.status(413).send(`413 Content Too Large: ${err.message}`);
      }
      return next();
    });
  };
};

module.exports = uploadImageMiddleware;
