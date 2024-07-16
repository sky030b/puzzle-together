import { navLinkUl, puzzleContainer } from './dom.js';
import { delay, getCookie } from './utils.js';
import { API_BASE_URL, CANVAS_HEIGHT, CANVAS_WIDTH, getCurrentGameId, getDifficulty, getPlaygroundStateByKey } from './variable.js';

export function createHintNavItem() {
  if (getDifficulty() !== 'hard') return;

  const existingNavItem = navLinkUl.querySelector('.hint-nav-item');
  if (existingNavItem) return;

  navLinkUl.innerHTML = `
    <li class="hint-nav-item nav-item">
      <a class="nav-link cursor-pointer show-hint-btn">
        使用提示
      </a>
    </li>
    ${navLinkUl.innerHTML}
  `;

  const showHintBtn = document.querySelector('.show-hint-btn');
  showHintBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const hint = await getHintInfo();

    const onePiece = document.querySelector('.puzzle-piece')
    const hintBoxWidth = onePiece.style.width;
    const hintBoxHeight = onePiece.style.height;
    console.log(getPlaygroundStateByKey('img'))
    hint
      .filter((puzzle) => puzzle.isLocked)
      .forEach((lockedPuzzle) => {
        const targetBox = document.querySelector(`#target${lockedPuzzle.targetId}`);
        const hintBox = document.createElement('div');
        hintBox.className = 'hint-box';
        hintBox.style.backgroundColor = 'green';
        hintBox.style.width = hintBoxWidth;
        hintBox.style.height = hintBoxHeight;
        targetBox.appendChild(hintBox);
        targetBox.style.opacity = 1;

        setTimeout(() => {
          hintBox.style.opacity = 0;
        }, 1000);

        setTimeout(() => {
          targetBox.removeChild(hintBox);
          targetBox.style.opacity = 0;
        }, 2000);
      });

    await delay(2000);

    hint
      .filter((puzzle) => !puzzle.isLocked)
      .forEach((unlockedPuzzle) => {
        const targetBox = document.querySelector(`#target${unlockedPuzzle.targetId}`);
        const hintBox = document.createElement('div');
        hintBox.className = 'hint-box';
        hintBox.style.backgroundColor = 'orange';
        hintBox.style.width = hintBoxWidth;
        hintBox.style.height = hintBoxHeight;
        targetBox.appendChild(hintBox);
        targetBox.style.opacity = 1;

        setTimeout(() => {
          hintBox.style.opacity = 0;
        }, 1000);

        setTimeout(() => {
          targetBox.removeChild(hintBox);
          targetBox.style.opacity = 0;
        }, 2000);
      });

    await delay(2000);

    hint
      .filter((puzzle) => !puzzle.isLocked)
      .forEach((unlockedPuzzle) => {
        const { topRatio, leftRatio } = unlockedPuzzle;
        const hintBox = document.createElement('div');
        hintBox.className = 'hint-box';
        puzzleContainer.appendChild(hintBox);
        hintBox.style.backgroundColor = 'pink';
        hintBox.style.top = `${(CANVAS_HEIGHT * topRatio) / 100}px`;
        hintBox.style.left = `${(CANVAS_WIDTH * leftRatio) / 100}px`;
        hintBox.style.width = hintBoxWidth;
        hintBox.style.height = hintBoxHeight;
        console.log(hintBox);

        setTimeout(() => {
          hintBox.style.opacity = 0;
        }, 1000);

        setTimeout(() => {
          puzzleContainer.removeChild(hintBox);
        }, 2000);
      });

  })
}

export async function getHintInfo() {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/1.0/games/${getCurrentGameId()}/hint`, {
      headers: {
        'Authorization': `Bearer ${getCookie('token')}`
      }
    });
    const hint = res.data;
    return hint;
  } catch (error) {
    console.error(error);
    Toastify({
      text: error.response.data,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "#e74c3c",
      stopOnFocus: true
    }).showToast();
    return error;
  }
}