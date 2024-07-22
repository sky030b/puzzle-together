const validateProfileLengthMiddleware = (req, res, next) => {
  const { profile } = req.body;

  if (typeof profile === 'string' && profile.length > 300) {
    return res.status(400).send('400 Bad Request: 自我介紹禁止超過 300 個字。');
  }

  return next();
};

module.exports = validateProfileLengthMiddleware;
