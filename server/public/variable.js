export const maxDimension = 1500;
export const canvasWidth = 16000;
export const canvasHeight = 12000;
export const scaleAmount = 0.01;

const EASY_OPACITY = 0.2;
const MEDIUM_OPACITY = 0.1;
const HARD_OPACITY = 0;

export function getOpacityByDifficulty(difficulty) {
  switch (difficulty) {
    case 'easy':
      return EASY_OPACITY;
    case 'medium':
      return MEDIUM_OPACITY;
    case 'hard':
      return HARD_OPACITY;
    default:
      return EASY_OPACITY;
  }
}

const EASY_OVERLAP_RATIO = 0.7;
const MEDIUM_OVERLAP_RATIO = 0.8;
const HARD_OVERLAP_RATIO = 0.9;

export function getOverlapRatioByDifficulty(difficulty) {
  switch (difficulty) {
    case 'easy':
      return EASY_OVERLAP_RATIO;
    case 'medium':
      return MEDIUM_OVERLAP_RATIO;
    case 'hard':
      return HARD_OVERLAP_RATIO;
    default:
      return EASY_OVERLAP_RATIO;
  }
}

const playgroundState = {
  scale: 1,
  currentGameId: '',
  isInsideChatArea: false,
  isInsideRecordArea: false
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

export function setIsInsideRecordArea(trueOrFalse) {
  playgroundState.isInsideRecordArea = trueOrFalse;
}

export function getIsInsideRecordArea() {
  return playgroundState.isInsideRecordArea;
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
