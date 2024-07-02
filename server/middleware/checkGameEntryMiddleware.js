const { getGamePublicInfo } = require("../services/gameDatabase");
const { checkoutInvited } = require("../services/playerGameDatabase");
const authenticateToken = require("./authenticateToken");

const checkGameEntryMiddleware = async (req, res, next) => {
  const { gameId } = req.params;

  const isPublic = await getGamePublicInfo(gameId);
  if (isPublic) return next();

  authenticateToken(req, res, async (err) => {
    if (err) return next(err);

    const { playerId } = res.locals.jwtData;
    const linkRecord = await checkoutInvited(playerId, gameId);
    if (linkRecord instanceof Error) return next(linkRecord);
    if (linkRecord.length) return next();
    return res.status(403).send(`403 Forbidden: 您沒有權限進入此遊戲關卡。請確保您已經收到邀請。`);
  });
};

module.exports = checkGameEntryMiddleware;
