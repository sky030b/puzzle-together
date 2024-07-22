const { getGamePublicInfo } = require('../models/gameDatabase');
const { checkoutInvited } = require('../models/playerGameDatabase');
const authenticateTokenMiddleware = require('./authenticateTokenMiddleware');

const checkGameEntryMiddleware = async (req, res, next) => {
  try {
    const { gameId } = req.params;

    const isPublic = await getGamePublicInfo(gameId);
    if (isPublic) return next();

    return authenticateTokenMiddleware(req, res, async (err) => {
      if (err) return next(err);

      const { playerId } = res.locals.jwtData;
      const linkRecord = await checkoutInvited(playerId, gameId);
      if (!linkRecord.length) return res.status(403).send('403 Forbidden: 您沒有權限存取此遊戲關卡。請確保您已經收到邀請。');
      return next();
    });
  } catch (error) {
    if (error.message === '找不到指定關卡的資訊。') return res.status(404).send('404 Not Found: 找不到指定關卡的資訊。');
    return res.status(500).send(error.message);
  }
};

module.exports = checkGameEntryMiddleware;
