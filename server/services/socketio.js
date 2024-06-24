const {
  updatePuzzleLocation, lockPuzzleBySomeone, getGameDurationByGameId, updateGameDurationByGameId
} = require('./gameDatabase');

const timersInfo = {}; // 用於儲存每個房間的計時器

const socket = (io) => {
  // 當有用戶連接時
  io.on('connection', (socketio) => {
    // eslint-disable-next-line no-console
    console.log('New client connected');

    socketio.on('joinRoom', async (gameId) => {
      socketio.join(gameId);

      let remainingClients = io.sockets.adapter.rooms.get(gameId)?.size || 0;
      if (remainingClients === 1) {
        const { play_duration: playDuration } = await getGameDurationByGameId(gameId);
        const timerInfo = { playDuration, startTime: new Date() };
        timersInfo[gameId] = timerInfo;
      }

      socketio.emit('timerUpdate', timersInfo[gameId]);

      socketio.on('movePiece', async (data) => {
        io.to(gameId).emit('movePiece', data);
        await updatePuzzleLocation(data);
      });

      socketio.on('lockPiece', async (data) => {
        socketio.to(gameId).emit('lockPiece', data);
        await lockPuzzleBySomeone(data);
      });

      socketio.on('newMessage', (data) => {
        io.to(gameId).emit('newMessage', data);
      });

      socketio.on('disconnect', async () => {
        remainingClients = io.sockets.adapter.rooms.get(gameId)?.size || 0;
        if (remainingClients === 0) {
          if (timersInfo[gameId]) {
            const { playDuration, startTime } = timersInfo[gameId];
            const increasedSec = Math.round((new Date() - new Date(startTime)) / 1000);
            const newPlayDuration = playDuration + increasedSec;
            await updateGameDurationByGameId(gameId, newPlayDuration);
            delete timersInfo[gameId];
          }
        }
        // eslint-disable-next-line no-console
        console.log('Client disconnected');
      });
    });
  });
};

module.exports = socket;
