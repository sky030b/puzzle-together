import { setupSocket } from './socket.js';
import renderGame from './puzzle.js';
import {
  container, canvas, targetContainer
} from './dom.js';
import {
  setScale, getScale, CANVAS_WIDTH, CANVAS_HEIGHT,
  SCALE_AMOUNT, INIT_SCALE, MIN_SCALE, MAX_SCALE,
  getIsInsideChatArea, getIsInsideRecordArea, getIsModalOpen,
  setCurrentGameId, getPlayerState
} from './variable.js';
import initPlayer from './player.js';
import renderChatHistory from './chat.js';
import { createHintNavItem } from './hint.js';

canvas.style.width = `${CANVAS_WIDTH}px`;
canvas.style.height = `${CANVAS_HEIGHT}px`;

let isDraggingCanvas = false;
let startX;
let startY;
let canvasStartX;
let canvasStartY;

export function centerView() {
  const containerRect = container.getBoundingClientRect();
  const targetContainerRect = targetContainer.getBoundingClientRect();

  const offsetX = (containerRect.width / 2)
    - (targetContainerRect.left + targetContainerRect.width / 2);
  const offsetY = (containerRect.height / 2)
    - (targetContainerRect.top + targetContainerRect.height / 2);

  canvas.style.left = `${offsetX}px`;
  canvas.style.top = `${offsetY}px`;
}

export function constrainCanvas() {
  const containerRect = container.getBoundingClientRect();
  const scaledWidth = canvas.clientWidth * getScale();
  const scaledHeight = canvas.clientHeight * getScale();

  let left = parseFloat(canvas.style.left || 0);
  let top = parseFloat(canvas.style.top || 0);

  if (scaledWidth <= containerRect.width) {
    left = (containerRect.width - scaledWidth) / 2;
  } else {
    if (left > 0) left = 0;
    if (left < containerRect.width - scaledWidth) left = containerRect.width - scaledWidth;
  }

  if (scaledHeight <= containerRect.height) {
    top = (containerRect.height - scaledHeight) / 2;
  } else {
    if (top > 0) top = 0;
    if (top < containerRect.height - scaledHeight) top = containerRect.height - scaledHeight;
  }

  canvas.style.left = `${left}px`;
  canvas.style.top = `${top}px`;
}

// const toMyShowcaseLink = document.querySelector('.to-my-showcase-link');
// toMyShowcaseLink.addEventListener('click', (e) => {
//   e.preventDefault();
//   window.location.href = `/profile/${getPlayerState().playerId}`;
// })

container.addEventListener('wheel', (e) => {
  if (getIsInsideChatArea() || getIsInsideRecordArea() || getIsModalOpen()) return;
  // e.preventDefault();
  const previousScale = getScale();
  let scaleTemp = getScale();

  if (e.deltaY < 0) {
    scaleTemp += SCALE_AMOUNT;
  } else {
    scaleTemp -= SCALE_AMOUNT;
  }

  setScale(Math.min(Math.max(MIN_SCALE, scaleTemp), MAX_SCALE));

  const rect = canvas.getBoundingClientRect();
  const offsetX = (e.pageX - rect.left) / rect.width;
  const offsetY = (e.pageY - rect.top) / rect.height;

  const newCanvasWidth = canvas.clientWidth * getScale();
  const newCanvasHeight = canvas.clientHeight * getScale();

  const dx = (newCanvasWidth - canvas.clientWidth * previousScale) * offsetX;
  const dy = (newCanvasHeight - canvas.clientHeight * previousScale) * offsetY;

  canvas.style.transform = `scale(${getScale()})`;
  canvas.style.left = `${parseFloat(canvas.style.left || 0) - dx}px`;
  canvas.style.top = `${parseFloat(canvas.style.top || 0) - dy}px`;

  constrainCanvas();
}, { passive: true });

container.addEventListener('mousedown', (e) => {
  if (e.target === canvas || e.target === container || e.target.parentNode === targetContainer
    || e.target.parentNode.parentNode === targetContainer 
    || e.target.dataset.isLocked === 'true' || e.target.classList.contains('hint-box')) {
    e.target.style.cursor = 'move';
    isDraggingCanvas = true;
    startX = e.pageX;
    startY = e.pageY;
    canvasStartX = parseFloat(canvas.style.left || 0);
    canvasStartY = parseFloat(canvas.style.top || 0);
  }
});

container.addEventListener('mousemove', (e) => {
  if (isDraggingCanvas) {
    const dx = (e.pageX - startX);
    const dy = (e.pageY - startY);

    canvas.style.left = `${canvasStartX + dx}px`;
    canvas.style.top = `${canvasStartY + dy}px`;

    constrainCanvas();
  }
});

container.addEventListener('mouseup', (e) => {
  e.target.style.cursor = 'default';
  isDraggingCanvas = false;
});

container.addEventListener('mouseleave', (e) => {
  e.target.style.cursor = 'default';
  isDraggingCanvas = false;
});

async function main() {
  try {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const gameId = urlParams.get('gameId');
    if (gameId) {
      setCurrentGameId(gameId);
    }

    const gameRenderResult = await renderGame();
    if (gameRenderResult instanceof Error) throw gameRenderResult;
    const playerInitResult = await initPlayer();
    if (playerInitResult instanceof Error) throw playerInitResult;
    const chatHistoryRenderResult = await renderChatHistory();
    if (chatHistoryRenderResult instanceof Error) throw chatHistoryRenderResult;
    setupSocket();

    setScale(INIT_SCALE);
    canvas.style.transform = `scale(${getScale()})`;
    constrainCanvas();

    centerView();
    createHintNavItem();
    return 'Game initialization done.';
  } catch (error) {
    return error;
  }
}

main().then((res) => {
  // eslint-disable-next-line no-console
  console.log(res);
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});
