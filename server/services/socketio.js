const { updatePuzzleLocation, lockPuzzleBySomeone } = require("./gameDatabase");

const socket = (io) => {
  // 當有用戶連接時
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('movePiece', (data) => {
      socket.broadcast.emit('movePiece', data);
      updatePuzzleLocation(data);
    });

    socket.on('lockPiece', (data) => {
      socket.broadcast.emit('lockPiece', data);
      lockPuzzleBySomeone(data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

module.exports = socket;
