/* eslint-disable no-console */
const { updatePuzzleLocation, lockPuzzleBySomeone } = require('./gameDatabase');

const socket = (io) => {
  // 當有用戶連接時
  io.on('connection', (socketio) => {
    console.log('New client connected');

    socketio.on('joinRoom', async (roomId) => {
      socketio.join(roomId);

      socketio.on('movePiece', async (data) => {
        socketio.to(roomId).emit('movePiece', data);
        await updatePuzzleLocation(data);
      });

      socketio.on('lockPiece', async (data) => {
        socketio.to(roomId).emit('lockPiece', data);
        await lockPuzzleBySomeone(data);
      });

      socketio.on('newMessage', (data) => {
        io.to(roomId).emit('newMessage', data);
      });

      socketio.on('disconnect', () => {
        const remainingClients = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        console.log(remainingClients);
        console.log('Client disconnected');
      });
    });
  });
};

module.exports = socket;
