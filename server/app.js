/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'https://puzzle-together.e055339.com'
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/dist')));
app.use(express.static(path.join(__dirname, '../client/')));

const socket = require('./services/socketio');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://puzzle-together.e055339.com'
  }
});

socket(io);

const API_VERSION = '1.0';
const PORT = process.env.PORT || 3000;

const playerRoutes = require('./routers/playerRoutes');
const gameRoutes = require('./routers/gameRoutes');
const chatRoutes = require('./routers/chatRoutes');
const postRoutes = require('./routers/postRoutes');

app.use(`/api/${API_VERSION}/players`, playerRoutes);
app.use(`/api/${API_VERSION}/games`, gameRoutes);
app.use(`/api/${API_VERSION}/chats`, chatRoutes);
app.use(`/api/${API_VERSION}/posts`, postRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('ok')
})

app.get('*', (req, res) => {
  res.sendFile(path.join(path.join(__dirname, 'public/dist'), 'index.html'));
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
