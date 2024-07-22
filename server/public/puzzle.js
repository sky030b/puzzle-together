/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable import/no-cycle */
import { container, canvas, targetContainer } from './dom.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, getScale, MAX_DIMENSION,
  getCurrentGameId, getPlayerState,
  getOpacityByDifficulty, getOverlapRatioByDifficulty,
  setPlaygroundStateByKey, API_BASE_URL
} from './variable.js';
import { getCookie, getFormattedNowTime, getImageDimensions } from './utils.js';
import { socket } from './socket.js';

export const puzzleTargetMap = {};

function createPuzzles(img, gameInfo) {
  const {
    rowQty, colQty, difficulty, puzzles
  } = gameInfo;

  const imgNow = img;
  if (imgNow.width > imgNow.height) {
    imgNow.scale = MAX_DIMENSION / imgNow.width;
  } else {
    imgNow.scale = MAX_DIMENSION / imgNow.height;
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

    puzzleTargetMap[`target${targetId}`] = puzzleId;

    const piece = document.createElement('div');
    piece.id = puzzleId;
    piece.className = `puzzle-piece${isLocked && ['easy', 'medium'].includes(difficulty) ? ' locked' : ''}`;
    piece.style.width = `${pieceWidth}px`;
    piece.style.height = `${pieceHeight}px`;
    piece.style.backgroundImage = `url(${imgNow.src})`;
    piece.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
    piece.style.backgroundPosition = `-${((targetId - 1) % cols) * pieceWidth}px -${Math.floor((targetId - 1) / cols) * pieceHeight}px`;
    piece.style.zIndex = zIndex;
    piece.style.top = `${(CANVAS_HEIGHT * topRatio) / 100}px`;
    piece.style.left = `${(CANVAS_WIDTH * leftRatio) / 100}px`;
    if (difficulty === 'hard') piece.style.borderWidth = '0';

    if (isLocked && ['easy', 'medium'].includes(difficulty)) {
      piece.dataset.isLocked = 'true';
      piece.dataset.lockedBy = lockedBy;
      piece.dataset.lockedColor = lockedColor;
    }

    puzzleContainer.appendChild(piece);
  });
}

function createTargetBoxes(img, gameInfo) {
  const {
    rowQty, colQty, puzzles, difficulty
  } = gameInfo;

  const scaledWidth = img.width * img.scale;
  const scaledHeight = img.height * img.scale;

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
    targetBox.style.borderWidth = `${['medium', 'hard'].includes(difficulty) ? '0px' : '1px'}`;
    targetBox.style.opacity = getOpacityByDifficulty(difficulty);

    if (['easy', 'medium'].includes(difficulty)) {
      targetBox.style.backgroundImage = `url(${img.src})`;
      targetBox.style.backgroundSize = `${img.width * img.scale}px ${img.height * img.scale}px`;
      targetBox.style.backgroundPosition = `-${((targetId - 1) % cols) * pieceWidth}px -${Math.floor((targetId - 1) / cols) * pieceHeight}px`;

      if (isLocked) {
        const piece = document.getElementById(puzzleId);
        piece.style.border = 'none';
        // piece.style.left = '50%';
        // piece.style.top = '50%';
        // piece.style.transform = 'translate(-50%, -50%)';
        piece.style.opacity = 1;
        targetBox.appendChild(piece);
        targetBox.style.opacity = 1;
        // targetBox.style.backgroundImage = 'none';
        targetBox.style.border = 'none';
      }
    }

    targetContainer.appendChild(targetBox);
  });

  targetContainer.style.left = `${(CANVAS_WIDTH - targetContainer.clientWidth) / 2}px`;
  targetContainer.style.top = `${(CANVAS_HEIGHT - targetContainer.clientHeight) / 2}px`;
}

function addDragAndDrop(gameInfo) {
  const { difficulty } = gameInfo;
  const puzzlePieces = document.querySelectorAll('.puzzle-piece');
  const targetBoxes = document.querySelectorAll('.target-box');
  let offsetX;
  let offsetY;
  let selectedPiece;
  let lastNotLockedPiece;

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
    // target.innerHTML = '';
    target.appendChild(element);
    target.style.width = '100%';
    target.style.height = '100%';
    target.style.opacity = 1;
    target.style.border = 'none';
    element.style.border = 'none';
    element.style.zIndex = '1';
  }

  function onMouseDown(e) {
    if (e.target.dataset.isLocked === 'true') return;

    if (lastNotLockedPiece) {
      lastNotLockedPiece.style.zIndex = '5';
      lastNotLockedPiece = null;
    }

    // const audioFiles = ['mine_in_chinese.mp3', 'mine.mp3'];
    // const randomIndex = Math.floor(Math.random() * audioFiles.length);
    // const player = new Audio(`https://dsz5eydy8se7.cloudfront.net/${audioFiles[randomIndex]}`);
    // player.play();

    selectedPiece = e.target;
    selectedPiece.dataset.moveBy = getPlayerState().nickname;
    socket.emit('changeMoveBy', { gameId: getCurrentGameId(), puzzleId: selectedPiece.id, moveBy: getPlayerState().nickname });
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
    if (selectedPiece.dataset.moveBy !== getPlayerState().nickname) {
      selectedPiece = null;
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    let dx = (e.clientX - canvasRect.left - offsetX) / getScale();
    let dy = (e.clientY - canvasRect.top - offsetY) / getScale();

    const pieceWidth = selectedPiece.clientWidth;
    const pieceHeight = selectedPiece.clientHeight;

    dx = Math.max(0, Math.min(dx, CANVAS_WIDTH - pieceWidth));
    dy = Math.max(0, Math.min(dy, CANVAS_HEIGHT - pieceHeight));

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
      leftRatio: (dx / CANVAS_WIDTH) * 100,
      topRatio: (dy / CANVAS_HEIGHT) * 100,
      isLocked: false,
      lockedBy: null,
      lockedColor: null,
      zIndex: '5',
      movedColor: getPlayerState().representColor,
      movedAt: getFormattedNowTime()
    });
  }

  function onMouseUp() {
    if (!selectedPiece) return;
    if (selectedPiece.dataset.moveBy !== getPlayerState().nickname) {
      selectedPiece = null;
      return;
    }

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    selectedPiece.style.cursor = 'grab';

    function emitUpdatePiece() {
      socket.emit('updatePiece', {
        gameId: getCurrentGameId(),
        puzzleId: selectedPiece.id,
        left: selectedPiece.style.left,
        top: selectedPiece.style.top,
        leftRatio: (+selectedPiece.style.left.replace('px', '') / CANVAS_WIDTH) * 100,
        topRatio: (+selectedPiece.style.top.replace('px', '') / CANVAS_HEIGHT) * 100,
        isLocked: false,
        lockedBy: null,
        lockedColor: null,
        zIndex: selectedPiece.style.zIndex,
        movedColor: getPlayerState().representColor,
        movedAt: getFormattedNowTime()
      });
    }

    function emitUpdateAndLockPiece(targetId, nickname, representColor) {
      socket.emit('updateAndLockPiece', {
        gameId: getCurrentGameId(),
        puzzleId: selectedPiece.id,
        targetId,
        difficulty,
        left: selectedPiece.style.left,
        top: selectedPiece.style.top,
        leftRatio: (+selectedPiece.style.left.replace('px', '') / CANVAS_WIDTH) * 100,
        topRatio: (+selectedPiece.style.top.replace('px', '') / CANVAS_HEIGHT) * 100,
        playerId: getPlayerState().playerId,
        isLocked: true,
        lockedBy: nickname,
        lockedColor: representColor,
        zIndex: selectedPiece.style.zIndex,
        movedColor: representColor,
        movedAt: getFormattedNowTime()
      });
    }

    let isLocked = false;
    let lockTargetId;
    let lockNickname;
    let lockRepresentColor;

    targetBoxes.forEach((target) => {
      const targetId = target.id;
      const pieceId = selectedPiece.id;
      const overlapRatio = calculateOverlap(selectedPiece, target);
      if (isNearTarget(selectedPiece, target)
        && overlapRatio >= getOverlapRatioByDifficulty(difficulty)) {
        if (!(difficulty === 'easy' && puzzleTargetMap[targetId] !== pieceId)) {
          selectedPiece.style.left = `${+targetContainer.style.left.replace('px', '')
            + +targetContainer.style.borderWidth.replace('px', '')
            + target.offsetLeft}px`;
          selectedPiece.style.top = `${+targetContainer.style.top.replace('px', '')
            + +targetContainer.style.borderWidth.replace('px', '')
            + target.offsetTop}px`;
        }

        const { nickname, representColor } = getPlayerState();
        if (puzzleTargetMap[targetId] === pieceId && ['easy', 'medium'].includes(difficulty)) {
          centerInTarget(selectedPiece, target);
          selectedPiece.dataset.isLocked = 'true';
          selectedPiece.dataset.lockedBy = nickname;
          selectedPiece.dataset.lockedColor = representColor;
          selectedPiece.classList.add('locked');
          selectedPiece.removeEventListener('mousedown', onMouseDown);
          selectedPiece.style.zIndex = '1';

          isLocked = true;
          lockTargetId = targetId;
          lockNickname = nickname;
          lockRepresentColor = representColor;
        } else {
          selectedPiece.style.zIndex = '5';
        }
      }
    });

    if (isLocked) {
      emitUpdateAndLockPiece(lockTargetId, lockNickname, lockRepresentColor);
    } else {
      emitUpdatePiece();
    }

    if (['5', '10'].includes(selectedPiece.style.zIndex)) {
      lastNotLockedPiece = selectedPiece;
      lastNotLockedPiece.style.zIndex = '6';
    }

    selectedPiece.removeAttribute('data-move-by');
    socket.emit('changeMoveBy', { gameId: getCurrentGameId(), puzzleId: selectedPiece.id, moveBy: null });

    selectedPiece = null;
  }

  puzzlePieces.forEach((piece) => {
    piece.addEventListener('mousedown', onMouseDown);
  });
}

export async function getRenderInfo() {
  try {
    const gameId = getCurrentGameId();

    const url = `${API_BASE_URL}/api/1.0/games/${gameId}`;
    // eslint-disable-next-line no-undef
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${getCookie('token')}`
      }
    });
    const renderInfo = res.data;

    // eslint-disable-next-line no-console
    console.log(renderInfo);

    if (!renderInfo) {
      // This is from toastify-js cdn
      // eslint-disable-next-line no-undef
      Toastify({
        text: '沒有找到指定的遊戲關卡。\n三秒後將轉址至遊戲總覽頁。',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#e74c3c',
        stopOnFocus: true
      }).showToast();
      setTimeout(() => { window.location.href = '/all-games'; }, 3000);
    }

    return renderInfo;
  } catch (error) {
    // This is from toastify-js cdn
    // eslint-disable-next-line no-undef
    Toastify({
      text: `${error.response.data}\n三秒後將轉址至遊戲總覽頁。`,
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#e74c3c',
      stopOnFocus: true
    }).showToast();

    setTimeout(() => { window.location.href = '/all-games'; }, 3000);
    return error;
  }
}

function basicSetting(img, gameInfo) {
  const { title } = gameInfo;
  const gameTitle = document.querySelector('.game-title');
  gameTitle.textContent = title;
  gameTitle.addEventListener('click', () => window.location.reload());

  document.title = `帕索兔蓋德 - ${title}`;
  setPlaygroundStateByKey('img', img);
  Object.entries(gameInfo).forEach(([key, value]) => {
    setPlaygroundStateByKey(key, value);
  });
}

export default async function renderGame() {
  try {
    const gameInfo = await getRenderInfo();
    const { questionImgUrl } = gameInfo;
    const img = await getImageDimensions(questionImgUrl);

    basicSetting(img, gameInfo);
    createPuzzles(img, gameInfo);
    createTargetBoxes(img, gameInfo);
    addDragAndDrop(gameInfo);
    return 'renderGame done.';
  } catch (error) {
    return error;
  }
}
