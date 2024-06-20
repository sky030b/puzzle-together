const { updatePuzzleLocation, lockPuzzleBySomeone } = require('./gameDatabase');

const socket = (io) => {
  // 當有用戶連接時
  io.on('connection', (socketio) => {
    console.log('New client connected');

    socketio.on('movePiece', (data) => {
      socketio.broadcast.emit('movePiece', data);
      updatePuzzleLocation(data);
    });

    socketio.on('lockPiece', (data) => {
      socketio.broadcast.emit('lockPiece', data);
      lockPuzzleBySomeone(data);
    });

    socketio.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

module.exports = socket;
