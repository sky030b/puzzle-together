import { setupSocket } from './socket.js';
import renderGame from './puzzle.js';
import {
  container, canvas, targetContainer
} from './dom.js';
import {
  setScale, getScale, canvasWidth, canvasHeight, scaleAmount,
  getIsInsideChatArea, getIsInsideRecordArea, setCurrentGameId
} from './variable.js';
import initPlayer from './player.js';
import renderChatHistory from './chat.js';

canvas.style.width = `${canvasWidth}px`;
canvas.style.height = `${canvasHeight}px`;

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

container.addEventListener('wheel', (e) => {
  if (getIsInsideChatArea() || getIsInsideRecordArea()) return;
  // e.preventDefault();
  const previousScale = getScale();
  let scaleTemp = getScale();

  if (e.deltaY < 0) {
    scaleTemp += scaleAmount;
  } else {
    scaleTemp -= scaleAmount;
  }

  setScale(Math.min(Math.max(0.1, scaleTemp), 2));

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
    || e.target.parentNode.parentNode === targetContainer) {
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

    setScale(0.5);
    canvas.style.transform = `scale(${getScale()})`;
    constrainCanvas();

    centerView();
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
