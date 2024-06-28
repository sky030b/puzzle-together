/* eslint-disable no-param-reassign */
import { getRenderInfo } from './puzzle.js';
import { getImageDimensions } from './utils.js';
import { clearTimer, getPlaygroundStateByKey } from './variable.js';

function createResultPuzzles(img, gameInfo) {
  const {
    rowQty, colQty, puzzles
  } = gameInfo;
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
    resultPiece.dataset.isLocked = isLocked ? 'true' : 'false';
    resultPiece.dataset.lockedBy = lockedBy;
    resultPiece.dataset.lockedColor = lockedColor;

    resultPuzzleContainer.appendChild(resultPiece);
  });
}

function createResultTargetBoxes(img, gameInfo) {
  const { rowQty, colQty, puzzles } = gameInfo;

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
      lockedColorBox.title = resultPiece.dataset.lockedBy;
      lockedColorBox.dataset.lockedBy = resultPiece.dataset.lockedBy;
      lockedColorBox.dataset.lockedColor = resultPiece.dataset.lockedColor;
      lockedColorBox.style.backgroundColor = resultPiece.dataset.lockedColor;
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

function disPlayResultNavLink() {
  const navLinkUl = document.querySelector('#navbarSupportedContent ul');
  navLinkUl.innerHTML += `
    <li ="result-nav-item nav-item">
      <a class="nav-link show-result-btn" data-bs-toggle="modal" href="javascript:;"
        data-bs-target="#exampleModal">
        查看成果圖
      </a>
    </li>
  `;
}

function createResultModal() {
  const resultModal = document.querySelector('#result-modal');
  resultModal.innerHTML = `
      <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel"><strong>恭喜通關拼圖遊戲！！</strong></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body mx-auto">
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
}

async function renderModalBody() {
  const modalBody = document.querySelector('.modal-body');
  modalBody.innerHTML = `
    <div id="result-target-container"></div>
    <div id="result-puzzle-container"></div>
  `;
  const gameInfo = await getRenderInfo();
  const { questionImgUrl } = gameInfo;
  const img = await getImageDimensions(questionImgUrl);

  createResultPuzzles(img, gameInfo);
  createResultTargetBoxes(img, gameInfo);
  generateLockedBox();
  const toggleOpacityBtn = document.querySelector('.toggle-opacity-button');
  toggleOpacityBtn.addEventListener('click', toggleContributionGraphOpacity);
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

export default function showResult() {
  disPlayResultNavLink();
  createResultModal();
  renderModalBody();
  const showResultBtn = document.querySelector('.show-result-btn');
  showResultBtn.click();
  const downloadOriginPicBtn = document.querySelector('.download-origin-pic');
  downloadOriginPicBtn.addEventListener('click', downloadOriginPic);
  clearTimer();
}
