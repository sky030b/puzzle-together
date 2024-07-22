/* eslint-disable no-console */
const { createAdapter } = require('@socket.io/redis-adapter');
const redisClient = require('./createRedisClient');

const {
  getGameDurationByGameId, updateGameDurationByGameId,
  updateGameIsCompletedStatus, getRenderInfoByGameId
} = require('./gameDatabase');
const { getGameCompletionInfo } = require('./gameHelpers');
const { lockPuzzleBySomeone, updatePuzzleLocation } = require('./puzzleDatabase');
const { savePuzzleMovementToRedis, savePuzzleMovementToDBWithPrefix } = require('./puzzleRedis');

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
  const pubClient = redisClient;
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socketio) => {
    console.log('New client connected');

    socketio.on('joinRoom', async (roomId, playerState) => {
      try {
        socketio.join(roomId);
        if (!roomsInfo[roomId]) {
          roomsInfo[roomId] = { playersInfo: [], timerInfo: null };
        }
        roomsInfo[roomId].playersInfo.push({ ...playerState, id: socketio.id });
        if (roomsInfo[roomId].playersInfo.length === 1) await setTimerFromDB(roomId);
        socketio.emit('setTimer', roomsInfo[roomId].timerInfo);
        io.to(roomId).emit('updateRecord', { gameId: roomId, playersInfo: roomsInfo[roomId].playersInfo });
      } catch (error) {
        console.error('Error in joinRoom:', error.message);
        socketio.emit('error', { message: 'Failed to join room' });
      }

      socketio.on('movePiece', async (data) => {
        try {
          await savePuzzleMovementToRedis(data);
          socketio.to(roomId).emit('movePiece', data);
        } catch (error) {
          console.error('Error in movePiece:', error.message);
          socketio.emit('error', { message: 'Failed to move piece' });
        }
      });

      socketio.on('updatePiece', async (data) => {
        try {
          await updatePuzzleLocation(data);
          // await updateGameIsCompletedStatus(roomId, 0);
          await savePuzzleMovementToRedis(data);
          const { puzzles } = await getRenderInfoByGameId(data.gameId);
          socketio.to(roomId).emit('updatePiece', data);
          io.to(roomId).emit('updatePuzzlesState', puzzles);
        } catch (error) {
          console.error('Error in updatePiece:', error.message);
          socketio.emit('error', { message: 'Failed to update piece' });
        }
      });

      socketio.on('changeMoveBy', (data) => {
        socketio.to(roomId).emit('changeMoveBy', data);
      });

      socketio.on('updateAndLockPiece', async (data) => {
        try {
          await updatePuzzleLocation(data);
          await savePuzzleMovementToRedis(data);
          const { isCompleted } = await lockPuzzleBySomeone(data);
          const { puzzles } = await getRenderInfoByGameId(data.gameId);
          io.to(roomId).emit('updateAndLockPiece', data);
          io.to(roomId).emit('updatePuzzlesState', puzzles);
          io.to(roomId).emit('updateRecord', { gameId: roomId, playersInfo: roomsInfo[roomId].playersInfo });
          if (isCompleted) {
            await updateDurationToDB(roomId);
            await updateGameIsCompletedStatus(roomId);
            await setTimerFromDB(roomId);
            await savePuzzleMovementToDBWithPrefix(`movement-${roomId}`);
            io.to(roomId).emit('setTimer', roomsInfo[roomId].timerInfo);
          }
        } catch (error) {
          console.error('Error in updateAndLockPiece:', error.message);
          socketio.emit('error', { message: 'Failed to update and lock piece' });
        }
      });

      socketio.on('sendNewMessage', (data) => {
        io.to(roomId).emit('sendNewMessage', data);
      });

      socketio.on('disconnect', async () => {
        try {
          roomsInfo[roomId].playersInfo = roomsInfo[roomId].playersInfo.filter(
            (player) => player.id !== socketio.id
          );

          io.to(roomId).emit('updateRecord', { gameId: roomId, playersInfo: roomsInfo[roomId].playersInfo });

          const { isCompleted } = await getGameCompletionInfo(roomId);
          if (!roomsInfo[roomId].playersInfo.length) {
            if (!isCompleted) await updateDurationToDB(roomId);
            delete roomsInfo[roomId];
          }
          console.log('Client disconnected');
        } catch (error) {
          console.error('Error in disconnect:', error.message);
        }
      });
    });
  });
};

module.exports = socket;
