export const container = document.getElementById('container');
export const canvas = document.getElementById('canvas');
export const targetContainer = document.getElementById('target-container');

export const canvasWidth = 8000;
export const canvasHeight = 6000;
canvas.style.width = `${canvasWidth}px`;
canvas.style.height = `${canvasHeight}px`;

export let scale = 1;
let isDraggingCanvas = false;
let startX, startY;
let canvasStartX, canvasStartY;

export function centerView() {
  const containerRect = container.getBoundingClientRect();
  const targetContainerRect = targetContainer.getBoundingClientRect();

  const offsetX = (containerRect.width / 2) - (targetContainerRect.left + targetContainerRect.width / 2);
  const offsetY = (containerRect.height / 2) - (targetContainerRect.top + targetContainerRect.height / 2);

  canvas.style.left = `${offsetX}px`;
  canvas.style.top = `${offsetY}px`;
}

export function constrainCanvas() {
  const containerRect = container.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const scaledWidth = canvas.clientWidth * scale;
  const scaledHeight = canvas.clientHeight * scale;

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
  e.preventDefault();
  const scaleAmount = 0.1;
  const previousScale = scale;

  if (e.deltaY < 0) {
    scale += scaleAmount;
  } else {
    scale -= scaleAmount;
  }

  scale = Math.min(Math.max(0.3, scale), 3);

  const rect = canvas.getBoundingClientRect();
  const offsetX = (e.pageX - rect.left) / rect.width;
  const offsetY = (e.pageY - rect.top) / rect.height;

  const newCanvasWidth = canvas.clientWidth * scale;
  const newCanvasHeight = canvas.clientHeight * scale;

  const dx = (newCanvasWidth - canvas.clientWidth * previousScale) * offsetX;
  const dy = (newCanvasHeight - canvas.clientHeight * previousScale) * offsetY;

  canvas.style.transform = `scale(${scale})`;
  canvas.style.left = `${parseFloat(canvas.style.left || 0) - dx}px`;
  canvas.style.top = `${parseFloat(canvas.style.top || 0) - dy}px`;

  constrainCanvas();
});

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


import { joinRoom, currentGameId } from './socket.js';
import { renderGame, renderGame2 } from './puzzle.js';

async function main() {
  joinRoom();
  const renderInfo = await renderGame();
  console.log(renderInfo)
  await renderGame2(renderInfo);

  scale = 0.5;
  canvas.style.transform = `scale(${scale})`;
  constrainCanvas();

  centerView();
}

main();
