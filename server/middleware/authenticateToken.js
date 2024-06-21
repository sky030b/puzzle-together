/* eslint-disable no-console */
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  let token = req.cookies.jwtToken || req.cookies.token || undefined;

  if (!token) {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).send('401 Unauthorized: Token is required.');
    }
    if (!authorization.startsWith('Bearer ')) {
      return res.status(403).send('403 Forbidden: Invalid authorization format.');
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

module.exports = authenticateToken;
