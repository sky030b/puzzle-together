/* eslint-disable import/no-cycle */
import { chatContent } from './dom.js';
import { addDragAndDrop } from './puzzle.js';
import { renderPlayDuration, renderRecord } from './record.js';
import { getFormattedTime } from './utils.js';
import { getCurrentGameId, getPlayerState } from './variable.js';

// eslint-disable-next-line no-undef
export const socket = io();

export function setupSocket() {
  const roomId = getCurrentGameId();
  const playerState = getPlayerState();
  if (roomId && playerState) {
    socket.emit('joinRoom', roomId, playerState);
  } else {
    // eslint-disable-next-line no-alert
    alert('請輸入有效的遊戲關卡ID。或是遊戲初始化失敗，請重新整理。');
  }

  socket.on('setTimer', (data) => {
    const { gameId, playDuration, startTime } = data;
    if (gameId === roomId) {
      setInterval(() => {
        // eslint-disable-next-line no-console
        console.log(playDuration + Math.floor((new Date() - new Date(startTime)) / 1000));
        renderPlayDuration(playDuration + Math.floor((new Date() - new Date(startTime)) / 1000));
      }, 1000);
    }
  });

  socket.on('updateRecord', (data) => {
    const { gameId, playersInfo } = data;
    if (gameId === roomId) {
      renderRecord(playersInfo);
    }
  });

  const syncPieceLocation = (data) => {
    const {
      gameId, puzzleId, left, top, zIndex
    } = data;
    if (gameId === roomId) {
      const piece = document.getElementById(puzzleId);
      if (piece) {
        piece.style.left = left;
        piece.style.top = top;
        piece.style.zIndex = zIndex;
      }
    }
  };

  socket.on('movePiece', syncPieceLocation);

  socket.on('updatePiece', syncPieceLocation);

  socket.on('changeMoveBy', (data) => {
    const { gameId, puzzleId, moveBy } = data;
    if (gameId === roomId) {
      const piece = document.getElementById(puzzleId);

      if (piece) {
        if (moveBy) {
          if (piece.dataset.moveBy && piece.dataset.moveBy !== moveBy) {
            const audioFiles = ['let_me_do_it_for_you.mp3', 'mine_in_chinese.mp3', 'mine.mp3'];
            const randomIndex = Math.floor(Math.random() * audioFiles.length);
            const player = new Audio(`https://dsz5eydy8se7.cloudfront.net/${audioFiles[randomIndex]}`);
            player.play();
          }
          piece.dataset.moveBy = moveBy;
        } else piece.removeAttribute('data-move-by');
      }
    }
  });

  socket.on('lockPiece', (data) => {
    const {
      gameId, puzzleId, targetId, difficulty, lockedBy, lockedColor, zIndex
    } = data;

    if (gameId === roomId && ['easy', 'medium'].includes(difficulty)) {
      const piece = document.getElementById(puzzleId);
      const target = document.getElementById(targetId);
      if (piece && target) {
        target.appendChild(piece);
        target.style.opacity = 1;
        // target.style.backgroundImage = 'none';
        target.style.border = 'none';
        piece.style.border = 'none';
        piece.style.zIndex = zIndex;
        piece.dataset.isLocked = 'true';
        piece.dataset.lockedBy = lockedBy;
        piece.dataset.lockedColor = lockedColor;
        piece.classList.add('locked');
        piece.removeEventListener('mousedown', addDragAndDrop.onMouseDown);
      }
    }
  });

  socket.on('completeGame', () => { alert('done'); });

  socket.on('sendNewMessage', (data) => {
    const { gameId, nickname, message } = data;

    if (gameId === roomId) {
      const str = `
        <div class="d-flex gap-2 mb-2">
          <div class="rounded-circle bg-light p-2 lh-1 align-self-start" title="${nickname}">${nickname[0]}</div>
          <div class="rounded bg-light text-break p-2">${message}</div>
          <small class="align-self-end text-light">${getFormattedTime()}</small>
        </div>
      `;
      chatContent.innerHTML += str;
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  });
}
