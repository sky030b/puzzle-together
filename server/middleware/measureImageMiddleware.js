const sharp = require('sharp');

const measureImageMiddleware = async (req, res, next) => {
  const { buffer } = req.file;
  const image = await sharp(buffer);
  const metadata = await image.metadata();
  
  const targetBaseSize = process.env.TARGET_BASE_SIZE;
  const img_width = metadata.width;
  const img_height = metadata.height;
  const scale = img_width >= img_height ? targetBaseSize / img_width : targetBaseSize / img_height;

  res.locals.measureImage = { img_width, img_height, scale };

  return next();
}

module.exports = measureImageMiddleware;
