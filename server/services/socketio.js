const {
  updatePuzzleLocation, lockPuzzleBySomeone, getGameDurationByGameId,
  updateGameDurationByGameId, getGameCompletionInfo, updateGameIsCompletedStatus
} = require('./gameDatabase');

const roomsInfo = {};

async function updateDurationToDB(roomId) {
  const { playDuration, startTime } = roomsInfo[roomId].timerInfo;
  const increasedSec = Math.floor((new Date() - new Date(startTime)) / 1000);
  const newPlayDuration = playDuration + increasedSec;
  await updateGameDurationByGameId(roomId, newPlayDuration);
}

async function setTimerFromDB(roomId) {
  const {
    play_duration: playDuration, is_completed: isCompleted
  } = await getGameDurationByGameId(roomId);
  const timerInfo = {
    gameId: roomId, playDuration, isCompleted, startTime: new Date()
  };
  roomsInfo[roomId].timerInfo = timerInfo;
}

const socket = (io) => {
  // 當有用戶連接時
  io.on('connection', (socketio) => {
    // eslint-disable-next-line no-console
    console.log('New client connected');

    socketio.on('joinRoom', async (roomId, playerState) => {
      socketio.join(roomId);

      if (!roomsInfo[roomId]) {
        roomsInfo[roomId] = { playersInfo: [], timerInfo: null };
      }
      roomsInfo[roomId].playersInfo.push({ ...playerState, id: socketio.id });

      if (roomsInfo[roomId].playersInfo.length === 1) await setTimerFromDB(roomId);

      socketio.emit('setTimer', roomsInfo[roomId].timerInfo);
      io.to(roomId).emit('updateRecord', { gameId: roomId, playersInfo: roomsInfo[roomId].playersInfo });

      socketio.on('movePiece', async (data) => {
        socketio.to(roomId).emit('movePiece', data);
      });

      socketio.on('updatePiece', async (data) => {
        socketio.to(roomId).emit('updatePiece', data);
        await updatePuzzleLocation(data);
        socketio.emit('updateDone');
      });

      socketio.on('changeMoveBy', async (data) => {
        io.to(roomId).emit('changeMoveBy', data);
      });

      socketio.on('lockPiece', async (data) => {
        const { isCompleted } = await lockPuzzleBySomeone(data);
        io.to(roomId).emit('lockPiece', data);
        io.to(roomId).emit('updateRecord', { gameId: roomId, playersInfo: roomsInfo[roomId].playersInfo });
        if (isCompleted) {
          await updateDurationToDB(roomId);
          await updateGameIsCompletedStatus(roomId);
          await setTimerFromDB(roomId);
          io.to(roomId).emit('setTimer', roomsInfo[roomId].timerInfo);
          io.to(roomId).emit('completeGame', roomsInfo[roomId].timerInfo);
        }
      });

      socketio.on('sendNewMessage', (data) => {
        io.to(roomId).emit('sendNewMessage', data);
      });

      socketio.on('disconnect', async () => {
        roomsInfo[roomId].playersInfo = roomsInfo[roomId].playersInfo.filter(
          (player) => player.id !== socketio.id
        );

        io.to(roomId).emit('updateRecord', { gameId: roomId, playersInfo: roomsInfo[roomId].playersInfo });

        const { isCompleted } = await getGameCompletionInfo(roomId);
        if (!roomsInfo[roomId].playersInfo.length) {
          if (!isCompleted) await updateDurationToDB(roomId);
          delete roomsInfo[roomId];
        }
        // eslint-disable-next-line no-console
        console.log('Client disconnected');
      });
    });
  });
};

module.exports = socket;
