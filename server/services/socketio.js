const {
  updatePuzzleLocation, lockPuzzleBySomeone, getGameDurationByGameId,
  updateGameDurationByGameId, getLastStartTimeByGameId, setLastStartTimeByGameId
} = require('./gameDatabase');

const timers = {}; // 用於儲存每個房間的計時器

const socket = (io) => {
  // 當有用戶連接時
  io.on('connection', (socketio) => {
    console.log('New client connected');

    socketio.on('joinRoom', async (gameId) => {
      socketio.join(gameId);

      let remainingClients = io.sockets.adapter.rooms.get(gameId)?.size || 0;

      if (remainingClients === 1) {
        const { play_duration: playDuration } = await getGameDurationByGameId(gameId);
        const { last_start_time: lastStartTime } = await setLastStartTimeByGameId(gameId);

        timers[gameId] = setInterval(() => {
          io.to(gameId).emit('timerUpdate', playDuration + Math.round((new Date() - new Date(lastStartTime)) / 1000));
        }, 1000);
      }

      socketio.on('timerUpdate', async (data) => {
        socketio.to(gameId).emit('timerUpdate', data);
      });

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
          if (timers[gameId]) clearInterval(timers[gameId]);
          const { last_start_time: lastStartTime } = await getLastStartTimeByGameId(gameId);
          const { play_duration: playDuration } = await getGameDurationByGameId(gameId);
          const newPlayDuration = playDuration + Math.round(
            (new Date() - new Date(lastStartTime)) / 1000
          );
          await updateGameDurationByGameId(gameId, newPlayDuration);
          delete timers[gameId];
        }
        console.log('Client disconnected');
      });
    });
  });
};

module.exports = socket;
