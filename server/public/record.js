import { recordArea } from './dom.js';
import { getDifficulty, getPlayerState, setIsInsideRecordArea } from './variable.js';

recordArea.addEventListener('mouseenter', () => {
  setIsInsideRecordArea(true);
});

recordArea.addEventListener('mouseleave', () => {
  setIsInsideRecordArea(false);
});

export function renderPlayDuration(playDurationSec) {
  // playDurationSec = 100000;
  const day = Math.floor(playDurationSec / 86400);
  const hr = Math.floor((playDurationSec % 86400) / 3600);
  const min = Math.floor((playDurationSec % 3600) / 60);
  const sec = Math.floor(playDurationSec % 60);
  const showTime = `${day ? `${day}天` : ''}${hr ? `${hr.toString().padStart(2, '0')}時` : ''}${min ? `${min.toString().padStart(2, '0')}分` : ''}${sec.toString().padStart(2, '0')}秒`;
  const playDurationDiv = document.querySelector('.play-duration');
  playDurationDiv.textContent = showTime;
  recordArea.classList.remove('d-none');
}

export function renderPlayersRecord(onlinePlayers) {
  const difficulty = getDifficulty();

  const onlinePlayerMap = new Map();
  onlinePlayers.forEach((player) => {
    const key = `${player.nickname}-${player.playerId}`;

    if (!onlinePlayerMap.has(key)) {
      onlinePlayerMap.set(key, player);
    }
  });
  const notRepeatOnlinePlayers = Array.from(onlinePlayerMap.values());

  const lockedPuzzles = document.querySelectorAll('[data-locked-by]');

  const lockedByInfoMap = new Map();

  lockedPuzzles.forEach((puzzleDiv) => {
    const nickname = puzzleDiv.dataset.lockedBy;
    const representColor = puzzleDiv.dataset.lockedColor;

    if (lockedByInfoMap.has(nickname)) {
      lockedByInfoMap.get(nickname).point += 1;
    } else {
      lockedByInfoMap.set(nickname, {
        nickname,
        representColor,
        isOnline: false,
        point: 1
      });
    }
  });

  const lockedByInfoAry = Array.from(lockedByInfoMap.values());

  const pastRecordsMap = lockedByInfoAry.reduce((acc, record) => {
    acc[record.nickname] = record;
    return acc;
  }, {});

  const onlinePlayersWithPoint = notRepeatOnlinePlayers
    .map((player) => {
      const pastRecord = pastRecordsMap[player.nickname];
      return {
        ...player,
        isOnline: true,
        point: pastRecord ? pastRecord.point : 0
      };
    })
    .sort((a, b) => {
      const { nickname } = getPlayerState();

      if (a.point !== b.point) {
        return b.point - a.point;
      }
      if (a.nickname === nickname) {
        return -1;
      }
      if (b.nickname === nickname) {
        return 1;
      }
      return a.nickname.localeCompare(b.nickname);
    });

  const offlinePlayers = lockedByInfoAry
    .filter((record) => !notRepeatOnlinePlayers.some(
      (player) => player.nickname === record.nickname
    ))
    .sort((a, b) => (
      a.point === b.point
        ? a.nickname.localeCompare(b.nickname)
        : b.point - a.point
    ));

  const sortedRecords = [...onlinePlayersWithPoint, ...offlinePlayers];

  const { nickname } = getPlayerState();
  const str = sortedRecords.map((recordInfo) => `
    <div class="d-flex justify-content-${difficulty === 'hard' ? 'center' : 'between'} mb-2">
      <div class="player-nickname text-truncate ${difficulty === 'hard' ? 'text-center' : ''} text-${nickname === recordInfo.nickname ? 'warning' : 'white'}${recordInfo.isOnline ? '' : '-50'} w-75 overflow-hidden">${recordInfo.nickname}</div>
      ${difficulty === 'hard' ? '' : `<div class="lock-puzzle-num text-truncate text-${nickname === recordInfo.nickname ? 'warning' : 'white'}${recordInfo.isOnline ? '' : '-50'} w-25 text-end">${recordInfo.point}</div>`}
    </div >
  `).join('');
  const recordLinesDiv = document.querySelector('.record-lines');
  recordLinesDiv.innerHTML = str;
}
