const {
  updatePuzzleLocation, lockPuzzleBySomeone, getGameDurationByGameId, updateGameDurationByGameId
} = require('./gameDatabase');

const timersInfo = {}; // 用於儲存每個房間的計時器
const roomsInfo = {}; // 用於儲存每個房間的各個玩家

const socket = (io) => {
  // 當有用戶連接時
  io.on('connection', (socketio) => {
    // eslint-disable-next-line no-console
    console.log('New client connected');

    socketio.on('joinRoom', async (roomId, playerState) => {
      socketio.join(roomId);

      if (!roomsInfo[roomId]) {
        roomsInfo[roomId] = [];
      }
      roomsInfo[roomId].push({ ...playerState, id: socketio.id });

      if (roomsInfo[roomId].length === 1) {
        const { play_duration: playDuration } = await getGameDurationByGameId(roomId);
        const timerInfo = { gameId: roomId, playDuration, startTime: new Date() };
        timersInfo[roomId] = timerInfo;
      }

      socketio.emit('setTimer', timersInfo[roomId]);
      io.to(roomId).emit('updateRecord', { gameId: roomId, playersInfo: roomsInfo[roomId] });

      socketio.on('movePiece', async (data) => {
        socketio.to(roomId).emit('movePiece', data);
        await updatePuzzleLocation(data);
      });

      socketio.on('changeMoveBy', async (data) => {
        io.to(roomId).emit('changeMoveBy', data);
      });

      socketio.on('lockPiece', async (data) => {
        socketio.to(roomId).emit('lockPiece', data);
        io.to(roomId).emit('updateRecord', { gameId: roomId, playersInfo: roomsInfo[roomId] });
        await lockPuzzleBySomeone(data);
      });

      socketio.on('sendNewMessage', (data) => {
        io.to(roomId).emit('sendNewMessage', data);
      });

      socketio.on('disconnect', async () => {
        roomsInfo[roomId] = roomsInfo[roomId].filter((player) => player.id !== socketio.id);
        io.to(roomId).emit('updateRecord', { gameId: roomId, playersInfo: roomsInfo[roomId] });

        if (!roomsInfo[roomId].length && timersInfo[roomId]) {
          const { playDuration, startTime } = timersInfo[roomId];
          const increasedSec = Math.floor((new Date() - new Date(startTime)) / 1000);
          const newPlayDuration = playDuration + increasedSec;
          await updateGameDurationByGameId(roomId, newPlayDuration);
          delete timersInfo[roomId];
          delete roomsInfo[roomId];
        }
        // eslint-disable-next-line no-console
        console.log('Client disconnected');
      });
    });
  });
};

module.exports = socket;
