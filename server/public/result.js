/* eslint-disable no-param-reassign */
import {
  getPlayerState, getPlaygroundState, getPlaygroundStateByKey, setIsModalOpen
} from './variable.js';

function lockAllPuzzles() {
  const puzzleDivs = document.querySelectorAll('.puzzle-piece');
  puzzleDivs.forEach((puzzleDiv) => {
    puzzleDiv.dataset.isLocked = 'true';
    puzzleDiv.classList.add('locked');
  })
}

function disableInviteModal() {
  const navLinkUl = document.querySelector('#navbarSupportedContent ul');
  const inviteNavItem = navLinkUl.querySelector('.invite-player-nav-item');
  navLinkUl.removeChild(inviteNavItem);
}

function createResultNavLink() {
  const navLinkUl = document.querySelector('#navbarSupportedContent ul');
  const existingNavItem = navLinkUl.querySelector('.result-nav-item');
  if (existingNavItem) return;
  navLinkUl.innerHTML = `
    <li class="result-nav-item nav-item">
      <a class="nav-link cursor-pointer show-result-btn" data-bs-toggle="modal" href="javascript:;"
        data-bs-target="#exampleModal">
        查看成果圖
      </a>
    </li>
    ${navLinkUl.innerHTML}
  `;
}

function createResultPuzzles(img) {
  const {
    rowQty, colQty, puzzles
  } = getPlaygroundState();
  const RESULT_MAX_DIMENSION = 400;
  const imgNow = img;
  if (imgNow.width > imgNow.height) {
    imgNow.scale = RESULT_MAX_DIMENSION / imgNow.width;
  } else {
    imgNow.scale = RESULT_MAX_DIMENSION / imgNow.height;
  }

  const scaledWidth = imgNow.width * imgNow.scale;
  const scaledHeight = imgNow.height * imgNow.scale;

  const rows = parseInt(rowQty, 10);
  const cols = parseInt(colQty, 10);
  const pieceWidth = scaledWidth / cols;
  const pieceHeight = scaledHeight / rows;

  const resultPuzzleContainer = document.getElementById('result-puzzle-container');
  resultPuzzleContainer.innerHTML = '';

  puzzles.forEach((puzzleInfo) => {
    const {
      targetId, puzzleId, isLocked, lockedBy, lockedColor, zIndex
    } = puzzleInfo;

    const resultPiece = document.createElement('div');
    resultPiece.id = `result-${puzzleId}`;
    resultPiece.className = 'result-puzzle-piece locked';
    resultPiece.style.width = `${pieceWidth}px`;
    resultPiece.style.height = `${pieceHeight}px`;
    resultPiece.style.backgroundImage = `url(${imgNow.src})`;
    resultPiece.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
    resultPiece.style.backgroundPosition = `-${((targetId - 1) % cols) * pieceWidth}px -${Math.floor((targetId - 1) / cols) * pieceHeight}px`;
    resultPiece.style.zIndex = zIndex;
    resultPiece.dataset.resultIsLocked = isLocked ? 'true' : 'false';
    resultPiece.dataset.resultLockedBy = lockedBy;
    resultPiece.dataset.resultLockedColor = lockedColor;

    resultPuzzleContainer.appendChild(resultPiece);
  });
}

function createResultTargetBoxes(img) {
  const { rowQty, colQty, puzzles } = getPlaygroundState();;

  const scaledWidth = img.width * img.scale;
  const scaledHeight = img.height * img.scale;

  const rows = parseInt(rowQty, 10);
  const cols = parseInt(colQty, 10);
  const pieceWidth = scaledWidth / cols;
  const pieceHeight = scaledHeight / rows;

  const resultTargetContainer = document.getElementById('result-target-container');
  resultTargetContainer.style.border = '3px solid black';
  resultTargetContainer.innerHTML = '';
  resultTargetContainer.style.gridTemplateColumns = `repeat(${cols}, ${pieceWidth}px)`;
  resultTargetContainer.style.gridTemplateRows = `repeat(${rows}, ${pieceHeight}px)`;
  resultTargetContainer.style.width = `${cols * pieceWidth}px`;
  resultTargetContainer.style.height = `${rows * pieceHeight}px`;

  puzzles.forEach((puzzleInfo) => {
    const { targetId, puzzleId } = puzzleInfo;
    const resultTargetBox = document.createElement('div');
    resultTargetBox.id = `result-target${targetId}`;
    resultTargetBox.className = 'result-target-box';
    resultTargetBox.style.width = `${pieceWidth}px`;
    resultTargetBox.style.height = `${pieceHeight}px`;

    const piece = document.getElementById(`result-${puzzleId}`);
    piece.style.border = 'none';
    piece.style.left = '50%';
    piece.style.top = '50%';
    piece.style.transform = 'translate(-50%, -50%)';
    piece.style.position = 'absolute';
    piece.style.opacity = 1;
    resultTargetBox.appendChild(piece);
    resultTargetBox.style.border = 'none';

    resultTargetContainer.appendChild(resultTargetBox);
  });
}

function generateLockedBox() {
  const resultTargetBoxes = document.querySelectorAll('.result-target-box');
  resultTargetBoxes.forEach((resultTargetBox) => {
    const resultPiece = resultTargetBox.querySelector('.result-puzzle-piece');
    if (resultPiece && !resultTargetBox.querySelector('.locked-color-box')) {
      const lockedColorBox = document.createElement('div');
      lockedColorBox.className = 'locked-color-box';
      lockedColorBox.title = resultPiece.dataset.resultLockedBy;
      lockedColorBox.dataset.resultLockedBy = resultPiece.dataset.resultLockedBy;
      lockedColorBox.dataset.resultLockedColor = resultPiece.dataset.resultLockedColor;
      lockedColorBox.style.backgroundColor = resultPiece.dataset.resultLockedColor;
      lockedColorBox.style.border = '1px solid black';
      lockedColorBox.style.width = '100%';
      lockedColorBox.style.height = '100%';
      lockedColorBox.style.zIndex = '6';
      lockedColorBox.style.opacity = 0;
      resultTargetBox.appendChild(lockedColorBox);
    }
  });
}

function toggleContributionGraphOpacity() {
  const resultPuzzlePieces = document.querySelectorAll('.result-puzzle-piece');
  resultPuzzlePieces.forEach((resultPiece) => {
    const lockedColorBox = resultPiece.parentNode.querySelector('.locked-color-box');
    if (lockedColorBox) {
      if (resultPiece.style.opacity === '0') {
        resultPiece.style.opacity = '1';
        lockedColorBox.style.opacity = '0';
      } else if (resultPiece.style.opacity === '0.5') {
        resultPiece.style.opacity = '0';
        lockedColorBox.style.opacity = '1';
      } else {
        resultPiece.style.opacity = '0.5';
        lockedColorBox.style.opacity = '0.5';
      }
    }
  });
}

function downloadOriginPic() {
  const imageUrl = getPlaygroundStateByKey('questionImgUrl');
  const link = document.createElement('a');
  link.href = imageUrl;
  link.target = '_blank';
  link.download = `${getPlaygroundStateByKey('title')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function createResultModal() {
  const resultModal = document.querySelector('#result-modal');
  resultModal.innerHTML = `
      <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel"><strong>恭喜通關${getPlaygroundStateByKey('title')}！！</strong></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body mx-auto d-flex justify-content-around align-items-center gap-5">
              ...
            </div>
            <div class="modal-footer justify-content-center">
            <button type="button" class="download-origin-pic btn btn-primary">下載原圖</button>
            <button type="button" class="btn btn-primary toggle-opacity-button">切換貢獻圖透明度</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
            </div>
          </div>
        </div>
      </div>
  `;

  const downloadOriginPicBtn = document.querySelector('.download-origin-pic');
  downloadOriginPicBtn.addEventListener('click', downloadOriginPic);

  const myModalEl = document.getElementById('exampleModal');
  myModalEl.addEventListener('hidden.bs.modal', () => {
    setIsModalOpen(false);
  });

  myModalEl.addEventListener('shown.bs.modal', () => {
    setIsModalOpen(true);
  });
}

function getPlayersRecord() {
  const lockedPuzzles = getPlaygroundStateByKey('puzzles').filter((puzzle) => puzzle.isLocked);

  const lockedByInfoMap = new Map();

  lockedPuzzles.forEach((puzzle) => {
    const nickname = puzzle.lockedBy;
    const representColor = puzzle.lockedColor;

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

  const playersRecord = lockedByInfoAry
    .sort((a, b) => (
      a.point === b.point
        ? a.nickname.localeCompare(b.nickname)
        : b.point - a.point
    ));

  return playersRecord;
}

function createResultRecord() {
  const resultRecord = document.querySelector('#result-record');
  const playDurationSec = getPlaygroundStateByKey('playDuration');

  const { nickname } = getPlayerState();
  const playersRecord = getPlayersRecord();
  const playersRecordStr = playersRecord.map((recordInfo) => `
    <tr ${nickname === recordInfo.nickname ? 'class="table-warning"' : ''}>
      <td class="px-3">      
        <div class="player-nickname text-center${nickname === recordInfo.nickname ? ' fw-bold' : ''}">${recordInfo.nickname}</div>
      </td>
      <td class="px-3">
        <div class="lock-puzzle-num text-center${nickname === recordInfo.nickname ? ' fw-bold' : ''}">${recordInfo.point}</div>
      </td>
    </tr>
  `).join('');

  const puzzlesRecordStr = `
    <table class="table table-secondary table-hover table-responsive mb-3">
      <thead>
        <tr>
          <th scope="col" class="px-5 text-center">玩家暱稱</th>
          <th scope="col" class="px-5 text-center">拼圖完成數</th>
        </tr>
      </thead>
      <tbody>
        ${playersRecordStr}
      </tbody>
    </table>
  `;

  const day = Math.floor(playDurationSec / 86400);
  const hr = Math.floor((playDurationSec % 86400) / 3600);
  const min = Math.floor((playDurationSec % 3600) / 60);
  const sec = Math.floor(playDurationSec % 60);
  const showTime = `${day ? `${day}天` : ''}${hr ? `${hr.toString().padStart(2, '0')}時` : ''}${min ? `${min.toString().padStart(2, '0')}分` : ''}${sec.toString().padStart(2, '0')}秒`;
  const playDurationStr = `<h4 class="text-center mb-3">通關所用時間：${showTime}</h4>`;

  resultRecord.innerHTML = puzzlesRecordStr + playDurationStr;
}

function renderModalBody() {
  const modalBody = document.querySelector('.modal-body');
  modalBody.innerHTML = `
    <div>
      <div id="result-target-container"></div>
      <div id="result-puzzle-container"></div>
    </div>
    <div>
      <div id="result-record"></div>
    </div>
  `;
  const img = getPlaygroundStateByKey('img');

  createResultPuzzles(img);
  createResultTargetBoxes(img);
  generateLockedBox();
  createResultRecord();
  const toggleOpacityBtn = document.querySelector('.toggle-opacity-button');
  toggleOpacityBtn.addEventListener('click', toggleContributionGraphOpacity);
}

export default function showResult() {
  lockAllPuzzles();
  disableInviteModal();
  createResultNavLink();
  createResultModal();
  renderModalBody();
  const showResultBtn = document.querySelector('.show-result-btn');
  showResultBtn.click();
}
