const { body, validationResult } = require('express-validator');

const validateSigninMiddleware = [
  body('email')
    .isEmail()
    .withMessage('請提供有效的電子郵件地址'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateSigninMiddleware;
