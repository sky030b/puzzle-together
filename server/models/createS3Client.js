const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_REGION,
  BUCKET_NAME
} = process.env;

const s3Client = new S3Client({
  region: S3_BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

async function uploadToS3(file) {
  const ext = file.mimetype.split('/')[1];
  const key = `img-${Date.now() + Math.floor(Math.random() * Date.now())}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  await s3Client.send(command);

  const imageUrl = `https://dsz5eydy8se7.cloudfront.net/${key}`;
  return imageUrl;
}

module.exports = { s3Client, uploadToS3 };
