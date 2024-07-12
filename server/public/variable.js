export const MAX_DIMENSION = 1500;
export const CANVAS_WIDTH = 16000;
export const CANVAS_HEIGHT = 12000;

export const SCALE_AMOUNT = 0.01;
export const INIT_SCALE = 0.3;
export const MIN_SCALE = 0.08;
export const MAX_SCALE = 1.2;

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
const MEDIUM_OVERLAP_RATIO = 0.75;
const HARD_OVERLAP_RATIO = 0.8;

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
  isInsideRecordArea: false,
  isModalOpen: false,
  timer: null,
  img: null,

  gameId: '',
  title: '',
  questionImgUrl: '',
  ownerId: '',
  rowQty: 4,
  colQty: 4,
  difficulty: '',
  mode: '',
  puzzles: [],
  isPublic: false,
  isOpenWhenOwnerNotIn: false,
  playDuration: 0,
  isCompleted: false,
  completedAt: ''
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

export function setIsModalOpen(trueOrFalse) {
  playgroundState.isModalOpen = trueOrFalse;
}

export function getIsModalOpen() {
  return playgroundState.isModalOpen;
}

export function setTimer(timer) {
  playgroundState.timer = timer;
}

export function clearTimer() {
  if (playgroundState.timer) clearInterval(playgroundState.timer);
}

export function setDifficulty(difficulty) {
  playgroundState.difficulty = difficulty;
}

export function getDifficulty() {
  return playgroundState.difficulty;
}

export function setPlaygroundStateByKey(key, value) {
  if (Object.prototype.hasOwnProperty.call(playgroundState, key)) {
    playgroundState[key] = value;
  } else {
    Toastify({
      text: '沒有指定的屬性，請再確認。',
      duration: 2000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "red",
      stopOnFocus: true
    }).showToast();
  }
}

export function getPlaygroundState() {
  return { ...playgroundState };
}

export function getPlaygroundStateByKey(key) {
  if (Object.prototype.hasOwnProperty.call(playgroundState, key)) {
    return playgroundState[key];
  }
  return '沒有指定的屬性，請再確認。';
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
