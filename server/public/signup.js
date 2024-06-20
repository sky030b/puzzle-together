/* eslint-disable no-undef */
import { getRandomHexCode, setCookie } from './utils.js';

const codeSelector = document.querySelector('#codeSelector');
codeSelector.value = `#${getRandomHexCode()}`;

async function signup(signupInfo) {
  const res = await axios.post('/api/1.0/players/signup', signupInfo);
  return res;
}

const signupForm = document.querySelector('.signup-form');
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (signupForm[3].value !== signupForm[4].value) {
    alert('兩次輸入的密碼不同，請再試一次。');
    return;
  }

  const signupInfo = {
    nickname: signupForm[0].value.trim(),
    represent_color: signupForm[1].value,
    email: signupForm[2].value.trim(),
    password: signupForm[3].value,
    is_room_public: signupForm[5].value === 'on'
  };

  const res = await signup(signupInfo);
  setCookie('token', res.data.data.accessToken, res.data.data.accessExpired);
  console.log(res);
  // window.location.href = `/playground.html?gameId=${res.data.game_id}`;
});
