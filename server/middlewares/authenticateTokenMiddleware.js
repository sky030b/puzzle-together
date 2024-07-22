/* eslint-disable no-console */
const jwt = require('jsonwebtoken');

const authenticateTokenMiddleware = (req, res, next) => {
  let token = req.cookies.jwtToken || req.cookies.token || undefined;

  if (!token) {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).send('401 Unauthorized: 請先登入');
    }
    if (!authorization.startsWith('Bearer ')) {
      return res.status(403).send('403 Forbidden: 無效的驗證格式，請重新登入');
    }

    token = authorization.replace('Bearer ', '');
  }

  res.locals.token = token;

  try {
    const jwtData = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    res.locals.jwtData = jwtData;
  } catch (err) {
    console.error('Error verifying JWT:', err);
    return res.status(403).send(`403 ${err.name}: ${err.message}`);
  }

  return next();
};

module.exports = authenticateTokenMiddleware;
