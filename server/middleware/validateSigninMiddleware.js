const { body, validationResult } = require('express-validator');

const validateSigninMiddleware = [
  body('email')
    .isEmail()
    .withMessage('請提供有效的電子郵件地址'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('密碼長度需至少8個字符'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateSigninMiddleware;
