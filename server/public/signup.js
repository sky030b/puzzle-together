/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable no-undef */
import { getRandomHexCode, setCookie } from './utils.js';

const codeSelector = document.querySelector('#codeSelector');
codeSelector.value = `#${getRandomHexCode()}`;

async function signup(signupInfo) {
  try {
    const res = await axios.post('/api/1.0/players/signup', signupInfo);
    return res;
  } catch (error) {
    return error;
  }
}

const signupForm = document.querySelector('.signup-form');
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    if (signupForm[3].value !== signupForm[4].value) {
      alert('兩次輸入的密碼不同，請再試一次。');
      return;
    }

    const signupInfo = {
      nickname: signupForm[0].value.trim(),
      represent_color: signupForm[1].value,
      email: signupForm[2].value.trim(),
      password: signupForm[3].value,
      is_room_public: signupForm[5].value
    };

    const res = await signup(signupInfo);
    if (res instanceof Error) throw res;

    const { accessToken, accessExpired } = res.data.data;
    setCookie('token', accessToken, accessExpired);
    alert('註冊成功。');
    // window.location.href = `/profile.html?playerId=${playerInfo.playerId}`;
  } catch (error) {
    console.error(error);
    alert(error.response.data);
  }
});
