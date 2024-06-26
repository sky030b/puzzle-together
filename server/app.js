const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../client/')));

const socket = require('./services/socketio');

const server = http.createServer(app);
const io = socketIo(server);

socket(io);

const API_VERSION = '1.0';
const PORT = process.env.PORT || 3000;

const playerRoutes = require('./routers/playerRoutes.js');
const gameRoutes = require('./routers/gameRoutes.js');

app.use(`/api/${API_VERSION}/players`, playerRoutes);
app.use(`/api/${API_VERSION}/games`, gameRoutes);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
