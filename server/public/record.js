import { recordArea } from './dom.js';
import { setIsInsideRecordArea } from './variable.js';

recordArea.addEventListener('mouseenter', () => {
  setIsInsideRecordArea(true);
});

recordArea.addEventListener('mouseleave', () => {
  setIsInsideRecordArea(false);
});

export default function renderPlayDuration(playDurationSec) {
  // playDurationSec = 100000;
  const day = Math.floor(playDurationSec / 86400);
  const hr = Math.floor((playDurationSec % 86400) / 3600);
  const min = Math.floor((playDurationSec % 3600) / 60);
  const sec = Math.floor(playDurationSec % 60);
  const showTime = `${day ? `${day}天` : ''}${hr ? `${hr.toString().padStart(2, '0')}時` : ''}${min ? `${min.toString().padStart(2, '0')}分` : ''}${sec.toString().padStart(2, '0')}秒`;
  const playDurationDiv = document.querySelector('.play-duration');
  playDurationDiv.textContent = showTime;
}
