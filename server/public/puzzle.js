import { canvasWidth, canvasHeight, scale, canvas } from './playground.js';
import { getRandomHexCode, getImageDimensions } from './utils.js';
import { socket, currentGameId } from './socket.js';

const puzzleTargetMap = {};

export async function renderGame() {
  try {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const gameId = urlParams.get('gameId');

    const url = `/api/1.0/games/${gameId}`;
    const res = await axios.get(url);
    const renderInfo = res.data;

    if (!renderInfo) {
      alert("沒有找到指定的遊戲關卡");
      window.location.href = '/index.html';
    }

    return renderInfo;
  } catch (error) {
    alert(error.message);
    alert("請輸入有效的遊戲關卡ID");
    window.location.href = '/index.html';
  }
}

export async function renderGame2(gameInfo) {
  const maxDimension = 1500;

  const {
    game_id, title, question_img_url, owner_id,
    row_qty, col_qty, difficulty, mode,
    puzzles,
    is_public, is_open_when_owner_not_in,
    play_duration, is_completed, completed_at
  } = gameInfo;

  const gameTitle = document.querySelector(".game-title");
  gameTitle.textContent = title;

  const img = await getImageDimensions(question_img_url);

  if (img.width > img.height) {
    img.scale = maxDimension / img.width;
  } else {
    img.scale = maxDimension / img.height;
  }

  const scaledWidth = img.width * img.scale;
  const scaledHeight = img.height * img.scale;

  const rows = parseInt(row_qty);
  const cols = parseInt(col_qty);
  const pieceWidth = scaledWidth / cols;
  const pieceHeight = scaledHeight / rows;

  const puzzleContainer = document.getElementById('puzzle-container');
  puzzleContainer.innerHTML = '';
  Object.keys(puzzleTargetMap).forEach(key => delete puzzleTargetMap[key]);

  puzzles.forEach((puzzleInfo) => {
    const {
      target_id, puzzle_id, top_ratio, left_ratio,
      is_locked, locked_by, locked_color, locked_at, z_index
    } = puzzleInfo;

    puzzleTargetMap[target_id] = puzzle_id;

    const piece = document.createElement('div');
    piece.id = puzzle_id;
    piece.className = `puzzle-piece ${is_locked ? 'locked' : ''}`;
    piece.style.width = `${pieceWidth}px`;
    piece.style.height = `${pieceHeight}px`;
    piece.style.backgroundImage = `url(${img.src})`;
    piece.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
    piece.style.backgroundPosition = `-${(puzzleInfo.target_id - 1) % cols * pieceWidth}px -${Math.floor((target_id - 1) / cols) * pieceHeight}px`;
    piece.style.zIndex = z_index;
    if (is_locked) {
      piece.dataset.isLocked = 'true';
      piece.dataset.lockedBy = locked_by;
      piece.dataset.lockedColor = locked_color;
      piece.dataset.lockedAt = locked_at;
    } else {
      piece.style.top = `${canvasHeight * top_ratio / 100}px`;
      piece.style.left = `${canvasWidth * left_ratio / 100}px`;
    }
    puzzleContainer.appendChild(piece);
  });

  createTargetBoxes(img, gameInfo);
  addDragAndDrop();
}

function createTargetBoxes(img, gameInfo) {
  const scaledWidth = img.width * img.scale;
  const scaledHeight = img.height * img.scale;

  const rows = parseInt(gameInfo.row_qty);
  const cols = parseInt(gameInfo.col_qty);
  const pieceWidth = scaledWidth / cols;
  const pieceHeight = scaledHeight / rows;

  const targetContainer = document.getElementById('target-container');
  targetContainer.style.border = '5px solid black';
  targetContainer.innerHTML = '';
  targetContainer.style.gridTemplateColumns = `repeat(${cols}, ${pieceWidth}px)`;
  targetContainer.style.gridTemplateRows = `repeat(${rows}, ${pieceHeight}px)`;
  targetContainer.style.width = `${cols * pieceWidth}px`;
  targetContainer.style.height = `${rows * pieceHeight}px`;

  gameInfo.puzzles.forEach((puzzleInfo) => {
    const targetBox = document.createElement('div');
    targetBox.id = 'target' + puzzleInfo.target_id;
    targetBox.className = 'target-box';
    targetBox.style.width = `${pieceWidth}px`;
    targetBox.style.height = `${pieceHeight}px`;
    targetBox.style.backgroundImage = `url(${img.src})`;
    targetBox.style.backgroundSize = `${img.width * img.scale}px ${img.height * img.scale}px`;
    targetBox.style.backgroundPosition = `-${(puzzleInfo.target_id - 1) % cols * pieceWidth}px -${Math.floor((puzzleInfo.target_id - 1) / cols) * pieceHeight}px`;
    targetBox.style.opacity = 0.2;

    if (puzzleInfo.is_locked) {
      const piece = document.getElementById(puzzleInfo.puzzle_id);
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

function addDragAndDrop() {
  const puzzlePieces = document.querySelectorAll('.puzzle-piece');
  const targetBoxes = document.querySelectorAll('.target-box');
  let offsetX, offsetY, selectedPiece;

  puzzlePieces.forEach(piece => {
    piece.addEventListener('mousedown', onMouseDown);
  });

  function onMouseDown(e) {
    if (e.target.dataset.isLocked === 'true') return;
    selectedPiece = e.target;
    selectedPiece.style.zIndex = '10';
    selectedPiece.style.cursor = 'grabbing';
    const rect = selectedPiece.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    if (!selectedPiece) return;
    const canvasRect = canvas.getBoundingClientRect();
    const dx = (e.clientX - canvasRect.left - offsetX) / scale;
    const dy = (e.clientY - canvasRect.top - offsetY) / scale;
    selectedPiece.style.left = `${dx}px`;
    selectedPiece.style.top = `${dy}px`;
    socket.emit('movePiece', {
      gameId: currentGameId,
      puzzleId: selectedPiece.id,
      left: selectedPiece.style.left,
      top: selectedPiece.style.top,
      leftRatio: dx / canvasWidth * 100,
      topRatio: dy / canvasHeight * 100
    });
  }

  function onMouseUp() {
    if (!selectedPiece) return;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    selectedPiece.style.cursor = 'grab';

    targetBoxes.forEach(target => {
      const targetId = parseInt(target.id.replace('target', ''));
      const pieceId = selectedPiece.id;
      if (isNearTarget(selectedPiece, target) && puzzleTargetMap[targetId] === pieceId) {
        const overlapRatio = calculateOverlap(selectedPiece, target);
        if (overlapRatio >= 0.7) {
          centerInTarget(selectedPiece, target);
          selectedPiece.dataset.isLocked = 'true';
          selectedPiece.style.zIndex = '1';
          selectedPiece.classList.add('locked');
          selectedPiece.removeEventListener('mousedown', onMouseDown);

          socket.emit('lockPiece', {
            gameId: currentGameId,
            puzzleId: selectedPiece.id,
            targetId: target.id,
            isLocked: true,
            lockedBy: 'player123',
            lockedColor: '#123456',
            zIndex: selectedPiece.style.zIndex
          });
        } else {
          selectedPiece.style.zIndex = '5';
        }
      }
    });
    selectedPiece = null;
  }

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
    target.innerHTML = '';
    target.appendChild(element);
    target.style.width = '100%';
    target.style.height = '100%';
    target.style.opacity = 1;
    target.style.backgroundImage = 'none';
    target.style.border = 'none';
    element.style.border = 'none';
    element.style.position = 'absolute';
    element.style.left = '50%';
    element.style.top = '50%';
    element.style.transform = 'translate(-50%, -50%)';
  }
}

document.getElementById('generate-locked-box-button').addEventListener('click', () => {
  const targetBoxes = document.querySelectorAll('.target-box');
  targetBoxes.forEach(targetBox => {
    const piece = targetBox.querySelector('.puzzle-piece');
    if (piece && !targetBox.querySelector('.locked-color-box')) {
      const lockedColorBox = document.createElement('div');
      lockedColorBox.className = 'locked-color-box';
      lockedColorBox.dataset.lockedBy = piece.dataset.lockedBy;
      lockedColorBox.dataset.lockedColor = piece.dataset.lockedColor;
      lockedColorBox.style.backgroundColor = `#${getRandomHexCode()}`;
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
  puzzlePieces.forEach(piece => {
    const lockedColorBox = piece.parentNode.querySelector('.locked-color-box');
    if (lockedColorBox) {
      if (piece.style.opacity === '0') {
        piece.style.opacity = '1';
        lockedColorBox.style.opacity = '0';
      } else {
        piece.style.opacity = '0';
        lockedColorBox.style.opacity = '1';
      }
    }
  });
});
