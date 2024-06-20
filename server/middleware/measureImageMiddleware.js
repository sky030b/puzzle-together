/* eslint-disable import/no-unresolved */
const sharp = require('sharp');

const measureImageMiddleware = async (req, res, next) => {
  const { buffer } = req.file;
  const image = await sharp(buffer);
  const metadata = await image.metadata();

  const targetBaseSize = process.env.TARGET_BASE_SIZE;
  const imgWidth = metadata.width;
  const imgHeight = metadata.height;
  const scale = imgWidth >= imgHeight ? targetBaseSize / imgWidth : targetBaseSize / imgHeight;

  res.locals.measureImage = { img_width: imgWidth, img_height: imgHeight, scale };

  return next();
};

module.exports = measureImageMiddleware;
