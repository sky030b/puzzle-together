export const maxDimension = 1500;
export const canvasWidth = 16000;
export const canvasHeight = 12000;

const playgroundState = {
  scale: 1,
  currentGameId: '',
  isInsideChatArea: false
};

export function setScale(newScale) {
  playgroundState.scale = newScale;
}

export function getScale() {
  return playgroundState.scale;
}

export function setCurrentGameId(newGameId) {
  playgroundState.currentGameId = newGameId;
}

export function getCurrentGameId() {
  return playgroundState.currentGameId;
}

export function setIsInsideChatArea(trueOrFalse) {
  playgroundState.isInsideChatArea = trueOrFalse;
}

export function getIsInsideChatArea() {
  return playgroundState.isInsideChatArea;
}

const playerState = {
  playerId: '',
  nickname: '',
  representColor: ''
};

export function setPlayerState(playerInfo) {
  const { playerId, nickname, representColor } = playerInfo;
  if (playerId) playerState.playerId = playerId;
  if (nickname) playerState.nickname = nickname;
  if (representColor) playerState.representColor = representColor;
}

export function getPlayerState() {
  return { ...playerState };
}
