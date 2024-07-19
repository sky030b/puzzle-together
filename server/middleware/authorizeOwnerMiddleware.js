const { getGameOwnerIdByGameId } = require('../services/gameDatabase');

const authorizeOwnerMiddleware = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { playerId } = res.locals.jwtData;

    const ownerId = await getGameOwnerIdByGameId(gameId);
    if (ownerId instanceof Error) {
      if (ownerId.message === '找不到指定關卡的資訊。') {
        return res.status(404).send('404 Not Found: 找不到指定關卡的資訊。');
      }
      throw ownerId;
    }

    if (ownerId !== playerId) {
      return res.status(403).send('403 Forbidden: 您無權限訪問此資源。');
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authorizeOwnerMiddleware;
