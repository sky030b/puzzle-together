const state = {
  scale: 1,
  currentGameId: ''
};

export const maxDimension = 1500;
export const canvasWidth = 8000;
export const canvasHeight = 6000;

export function setScale(newScale) {
  state.scale = newScale;
}

export function getScale() {
  return state.scale;
}

export function setCurrentGameId(newGameId) {
  state.currentGameId = newGameId;
}

export function getCurrentGameId() {
  return state.currentGameId;
}