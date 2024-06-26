export const socket = io();
export let currentGameId = '';

export function joinRoom() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const gameId = urlParams.get('gameId');
  if (gameId) {
    socket.emit('joinRoom', gameId);
    currentGameId = gameId;
  }
}

socket.on('movePiece', (data) => {
  if (data.gameId === currentGameId) {
    const piece = document.getElementById(data.puzzleId);
    if (piece) {
      piece.style.left = data.left;
      piece.style.top = data.top;
    }
  }
});

socket.on('lockPiece', (data) => {
  if (data.gameId === currentGameId) {
    const piece = document.getElementById(data.puzzleId);
    const target = document.getElementById(data.targetId);
    if (piece && target) {
      target.appendChild(piece);
      target.style.opacity = 1;
      target.style.backgroundImage = 'none';
      target.style.border = 'none';
      piece.style.border = 'none';
      piece.style.left = '50%';
      piece.style.top = '50%';
      piece.style.zIndex = data.zIndex;
      piece.style.transform = 'translate(-50%, -50%)';
      piece.dataset.isLocked = 'true';
      piece.classList.add('locked');
      piece.removeEventListener('mousedown', onMouseDown);
    }
  }
});
