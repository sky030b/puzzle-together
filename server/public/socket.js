/* eslint-disable import/no-cycle */
import { chatContent } from './dom.js';
import { addDragAndDrop } from './puzzle.js';
import { getFormattedTime } from './utils.js';
import { getCurrentGameId, setCurrentGameId } from './variable.js';

// eslint-disable-next-line no-undef
export const socket = io();

export function joinRoom() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const gameId = urlParams.get('gameId');
  if (gameId) {
    socket.emit('joinRoom', gameId);
    setCurrentGameId(gameId);
  }
}

socket.on('timerUpdate', (data) => {
  // if (data.gameId === getCurrentGameId()) {
  console.log(data);
  const { playDuration, startTime } = data;
  setInterval(() => {
    console.log(playDuration + Math.round((new Date() - new Date(startTime)) / 1000));
  }, 1000);
  // }
});

socket.on('movePiece', (data) => {
  if (data.gameId === getCurrentGameId()) {
    const piece = document.getElementById(data.puzzleId);
    if (piece) {
      piece.style.left = data.left;
      piece.style.top = data.top;
    }
  }
});

socket.on('lockPiece', (data) => {
  const {
    gameId, puzzleId, targetId, lockedBy, lockedColor, zIndex
  } = data;

  if (gameId === getCurrentGameId()) {
    const piece = document.getElementById(puzzleId);
    const target = document.getElementById(targetId);
    if (piece && target) {
      target.appendChild(piece);
      target.style.opacity = 1;
      target.style.backgroundImage = 'none';
      target.style.border = 'none';
      piece.style.border = 'none';
      piece.style.left = '50%';
      piece.style.top = '50%';
      piece.style.zIndex = zIndex;
      piece.style.transform = 'translate(-50%, -50%)';
      piece.dataset.isLocked = 'true';
      piece.dataset.lockedBy = lockedBy;
      piece.dataset.lockedColor = lockedColor;
      piece.classList.add('locked');
      piece.removeEventListener('mousedown', addDragAndDrop.onMouseDown);
    }
  }
});

socket.on('newMessage', (data) => {
  const { gameId, nickname, message } = data;

  if (gameId === getCurrentGameId()) {
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
