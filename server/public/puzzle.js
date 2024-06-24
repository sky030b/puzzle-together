/* eslint-disable no-alert */
/* eslint-disable import/no-cycle */
import { container, canvas, targetContainer } from './dom.js';
import {
  canvasWidth, canvasHeight, getScale, maxDimension,
  getCurrentGameId, getPlayerState
} from './variable.js';

import { getImageDimensions } from './utils.js';
import { socket } from './socket.js';

const puzzleTargetMap = {};

function createPuzzles(img, gameInfo) {
  const {
    gameId, title, questionImgUrl, ownerId,
    rowQty, colQty, difficulty, mode,
    puzzles,
    isPublic, isOpenWhenOwnerNotIn,
    playDuration, isCompleted, completedAt
  } = gameInfo;

  const imgNow = img;
  if (imgNow.width > imgNow.height) {
    imgNow.scale = maxDimension / imgNow.width;
  } else {
    imgNow.scale = maxDimension / imgNow.height;
  }

  const scaledWidth = imgNow.width * imgNow.scale;
  const scaledHeight = imgNow.height * imgNow.scale;

  const rows = parseInt(rowQty, 10);
  const cols = parseInt(colQty, 10);
  const pieceWidth = scaledWidth / cols;
  const pieceHeight = scaledHeight / rows;

  const puzzleContainer = document.getElementById('puzzle-container');
  puzzleContainer.innerHTML = '';
  Object.keys(puzzleTargetMap).forEach((key) => delete puzzleTargetMap[key]);

  puzzles.forEach((puzzleInfo) => {
    const {
      targetId, puzzleId, topRatio, leftRatio, isLocked, lockedBy, lockedColor, zIndex
    } = puzzleInfo;

    puzzleTargetMap[targetId] = puzzleId;

    const piece = document.createElement('div');
    piece.id = puzzleId;
    piece.className = `puzzle-piece ${isLocked ? 'locked' : ''}`;
    piece.style.width = `${pieceWidth}px`;
    piece.style.height = `${pieceHeight}px`;
    piece.style.backgroundImage = `url(${imgNow.src})`;
    piece.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
    piece.style.backgroundPosition = `-${((targetId - 1) % cols) * pieceWidth}px -${Math.floor((targetId - 1) / cols) * pieceHeight}px`;
    piece.style.zIndex = zIndex;
    if (isLocked) {
      piece.dataset.isLocked = 'true';
      piece.dataset.lockedBy = lockedBy;
      piece.dataset.lockedColor = lockedColor;
    } else {
      piece.style.top = `${(canvasHeight * topRatio) / 100}px`;
      piece.style.left = `${(canvasWidth * leftRatio) / 100}px`;
    }
    puzzleContainer.appendChild(piece);
  });
}

function createTargetBoxes(img, gameInfo) {
  const { rowQty, colQty, puzzles } = gameInfo;

  const imgNow = img;
  const scaledWidth = imgNow.width * imgNow.scale;
  const scaledHeight = imgNow.height * imgNow.scale;

  const rows = parseInt(rowQty, 10);
  const cols = parseInt(colQty, 10);
  const pieceWidth = scaledWidth / cols;
  const pieceHeight = scaledHeight / rows;

  targetContainer.style.border = '5px solid black';
  targetContainer.innerHTML = '';
  targetContainer.style.gridTemplateColumns = `repeat(${cols}, ${pieceWidth}px)`;
  targetContainer.style.gridTemplateRows = `repeat(${rows}, ${pieceHeight}px)`;
  targetContainer.style.width = `${cols * pieceWidth}px`;
  targetContainer.style.height = `${rows * pieceHeight}px`;

  puzzles.forEach((puzzleInfo) => {
    const { targetId, puzzleId, isLocked } = puzzleInfo;

    const targetBox = document.createElement('div');
    targetBox.id = `target${targetId}`;
    targetBox.className = 'target-box';
    targetBox.style.width = `${pieceWidth}px`;
    targetBox.style.height = `${pieceHeight}px`;
    targetBox.style.backgroundImage = `url(${imgNow.src})`;
    targetBox.style.backgroundSize = `${imgNow.width * imgNow.scale}px ${imgNow.height * imgNow.scale}px`;
    targetBox.style.backgroundPosition = `-${((targetId - 1) % cols) * pieceWidth}px -${Math.floor((targetId - 1) / cols) * pieceHeight}px`;
    targetBox.style.opacity = 0.2;

    if (isLocked) {
      const piece = document.getElementById(puzzleId);
      piece.style.border = 'none';
      piece.style.left = '50%';
      piece.style.top = '50%';
      piece.style.transform = 'translate(-50%, -50%)';
      piece.style.opacity = 1;
      targetBox.appendChild(piece);
      targetBox.style.opacity = 1;
      targetBox.style.backgroundImage = 'none';
      targetBox.style.border = 'none';
    }

    targetContainer.appendChild(targetBox);
  });

  targetContainer.style.left = `${(canvasWidth - targetContainer.clientWidth) / 2}px`;
  targetContainer.style.top = `${(canvasHeight - targetContainer.clientHeight) / 2}px`;
}

export function addDragAndDrop() {
  const puzzlePieces = document.querySelectorAll('.puzzle-piece');
  const targetBoxes = document.querySelectorAll('.target-box');
  let offsetX;
  let offsetY;
  let selectedPiece;

  function isNearTarget(element, target) {
    const rect1 = element.getBoundingClientRect();
    const rect2 = target.getBoundingClientRect();

    const isInHorizontalBound = rect1.left < rect2.right && rect1.right > rect2.left;
    const isInVerticalBound = rect1.top < rect2.bottom && rect1.bottom > rect2.top;

    return isInHorizontalBound && isInVerticalBound;
  }

  function calculateOverlap(element, target) {
    const rect1 = element.getBoundingClientRect();
    const rect2 = target.getBoundingClientRect();

    const overlapWidth = Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left);
    const overlapHeight = Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top);

    if (overlapWidth <= 0 || overlapHeight <= 0) {
      return 0;
    }

    const overlapArea = overlapWidth * overlapHeight;
    const elementArea = rect1.width * rect1.height;

    return overlapArea / elementArea;
  }

  function centerInTarget(element, target) {
    const elementNow = element;
    const targetNow = target;
    targetNow.innerHTML = '';
    targetNow.appendChild(element);
    targetNow.style.width = '100%';
    targetNow.style.height = '100%';
    targetNow.style.opacity = 1;
    targetNow.style.backgroundImage = 'none';
    targetNow.style.border = 'none';
    elementNow.style.border = 'none';
    elementNow.style.position = 'absolute';
    elementNow.style.left = '50%';
    elementNow.style.top = '50%';
    elementNow.style.zIndex = '1';
    elementNow.style.transform = 'translate(-50%, -50%)';
  }

  let onMouseMove;
  let onMouseUp;
  const onMouseDown = (e) => {
    if (e.target.dataset.isLocked === 'true') return;
    selectedPiece = e.target;
    selectedPiece.style.zIndex = '10';
    selectedPiece.style.cursor = 'grabbing';
    const rect = selectedPiece.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  onMouseMove = (e) => {
    if (!selectedPiece) return;

    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    let dx = (e.clientX - canvasRect.left - offsetX) / getScale();
    let dy = (e.clientY - canvasRect.top - offsetY) / getScale();

    const pieceWidth = selectedPiece.clientWidth;
    const pieceHeight = selectedPiece.clientHeight;

    dx = Math.max(0, Math.min(dx, canvasWidth - pieceWidth));
    dy = Math.max(0, Math.min(dy, canvasHeight - pieceHeight));

    const pieceRect = selectedPiece.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const containerRight = containerRect.right;
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;

    if (pieceRect.left < containerLeft) {
      dx += (containerLeft - pieceRect.left) / getScale();
    }
    if (pieceRect.right > containerRight) {
      dx -= (pieceRect.right - containerRight) / getScale();
    }
    if (pieceRect.top < containerTop) {
      dy += (containerTop - pieceRect.top) / getScale();
    }
    if (pieceRect.bottom > containerBottom) {
      dy -= (pieceRect.bottom - containerBottom) / getScale();
    }

    selectedPiece.style.left = `${dx}px`;
    selectedPiece.style.top = `${dy}px`;
    socket.emit('movePiece', {
      gameId: getCurrentGameId(),
      puzzleId: selectedPiece.id,
      left: selectedPiece.style.left,
      top: selectedPiece.style.top,
      leftRatio: (dx / canvasWidth) * 100,
      topRatio: (dy / canvasHeight) * 100
    });
  };

  onMouseUp = () => {
    if (!selectedPiece) return;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    selectedPiece.style.cursor = 'grab';

    targetBoxes.forEach((target) => {
      const targetId = parseInt(target.id.replace('target', ''), 10);
      const pieceId = selectedPiece.id;
      if (isNearTarget(selectedPiece, target)) {
        const overlapRatio = calculateOverlap(selectedPiece, target);
        if (overlapRatio >= 0.7 && puzzleTargetMap[targetId] === pieceId) {
          const { nickname, representColor } = getPlayerState();
          centerInTarget(selectedPiece, target);
          selectedPiece.dataset.isLocked = 'true';
          selectedPiece.dataset.lockedBy = nickname;
          selectedPiece.dataset.lockedColor = representColor;
          selectedPiece.classList.add('locked');
          selectedPiece.removeEventListener('mousedown', onMouseDown);

          socket.emit('lockPiece', {
            gameId: getCurrentGameId(),
            puzzleId: selectedPiece.id,
            targetId: target.id,
            isLocked: true,
            lockedBy: nickname,
            lockedColor: representColor,
            zIndex: selectedPiece.style.zIndex
          });
        } else if (overlapRatio >= 0.7) {
          selectedPiece.style.left = `${+targetContainer.style.left.replace('px', '')
            + +targetContainer.style.borderWidth.replace('px', '')
            + target.offsetLeft}px`;
          selectedPiece.style.top = `${+targetContainer.style.top.replace('px', '')
            + +targetContainer.style.borderWidth.replace('px', '')
            + target.offsetTop}px`;
          selectedPiece.style.zIndex = '5';
        }
      }
    });
    selectedPiece = null;
  };

  puzzlePieces.forEach((piece) => {
    piece.addEventListener('mousedown', onMouseDown);
  });
}

document.getElementById('generate-locked-box-button').addEventListener('click', () => {
  const targetBoxes = document.querySelectorAll('.target-box');
  targetBoxes.forEach((targetBox) => {
    const piece = targetBox.querySelector('.puzzle-piece');
    if (piece && !targetBox.querySelector('.locked-color-box')) {
      const lockedColorBox = document.createElement('div');
      lockedColorBox.className = 'locked-color-box';
      lockedColorBox.title = piece.dataset.lockedBy;
      lockedColorBox.dataset.lockedBy = piece.dataset.lockedBy;
      lockedColorBox.dataset.lockedColor = piece.dataset.lockedColor;
      lockedColorBox.style.backgroundColor = piece.dataset.lockedColor;
      lockedColorBox.style.border = '1px solid black';
      lockedColorBox.style.width = '100%';
      lockedColorBox.style.height = '100%';
      lockedColorBox.style.zIndex = '2';
      lockedColorBox.style.opacity = 0;
      targetBox.appendChild(lockedColorBox);
    }
  });
});

document.getElementById('toggle-opacity-button').addEventListener('click', () => {
  const puzzlePieces = document.querySelectorAll('.puzzle-piece');
  puzzlePieces.forEach((piece) => {
    const lockedColorBox = piece.parentNode.querySelector('.locked-color-box');
    const pieceNow = piece;
    if (lockedColorBox) {
      if (piece.style.opacity === '0') {
        pieceNow.style.opacity = '0.5';
        lockedColorBox.style.opacity = '0.5';
      } else if (piece.style.opacity === '0.5') {
        pieceNow.style.opacity = '1';
        lockedColorBox.style.opacity = '0';
      } else {
        pieceNow.style.opacity = '0';
        lockedColorBox.style.opacity = '1';
      }
    }
  });
});

async function getRenderInfo() {
  try {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const gameId = urlParams.get('gameId');

    const url = `/api/1.0/games/${gameId}`;
    // eslint-disable-next-line no-undef
    const res = await axios.get(url);
    const renderInfo = res.data;

    // eslint-disable-next-line no-console
    console.log(renderInfo);

    if (!renderInfo) {
      alert('沒有找到指定的遊戲關卡');
      window.location.href = '/index.html';
    }

    return renderInfo;
  } catch (error) {
    alert(error.response.data);
    alert('請輸入有效的遊戲關卡ID');
    window.location.href = '/index.html';
    return error;
  }
}

export default async function renderGame() {
  try {
    const gameInfo = await getRenderInfo();
    const { questionImgUrl, title } = gameInfo;
    const img = await getImageDimensions(questionImgUrl);

    const gameTitle = document.querySelector('.game-title');
    gameTitle.textContent = title;
    gameTitle.addEventListener('click', () => window.location.reload());

    document.title += ` ${title}`;

    createPuzzles(img, gameInfo);
    createTargetBoxes(img, gameInfo);
    addDragAndDrop();
    return 'renderGame done.';
  } catch (error) {
    return error;
  }
}
