const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const socket = require('./services/socket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

socket(io);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
