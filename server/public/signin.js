/* eslint-disable no-undef */
import { setCookie } from './utils.js';

async function signin(signinInfo) {
  const res = await axios.post('/api/1.0/players/signin', signinInfo);
  return res;
}

const signinForm = document.querySelector('.signin-form');
signinForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const signinInfo = {
    email: signinForm[0].value.trim(),
    password: signinForm[1].value
  };

  const res = await signin(signinInfo);
  setCookie('token', res.data.data.accessToken, res.data.data.accessExpired);
  console.log(res);
  // window.location.href = `/playground.html?gameId=${res.data.game_id}`;
});
