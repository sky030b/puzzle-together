/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable no-undef */
import { setCookie } from './utils.js';

async function signin(signinInfo) {
  try {
    const res = await axios.post('/api/1.0/players/signin', signinInfo);
    return res;
  } catch (error) {
    return error;
  }
}

const signinForm = document.querySelector('.signin-form');
signinForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const signinInfo = {
      email: signinForm[0].value.trim(),
      password: signinForm[1].value
    };

    const res = await signin(signinInfo);
    if (res instanceof Error) throw res;

    const { accessToken, accessExpired } = res.data.data;
    setCookie('token', accessToken, accessExpired);
    alert('登入成功。');
    // window.location.href = `/profile.html?playerId=${playerInfo.playerId}`;
  } catch (error) {
    console.error(error);
    alert(error.response.data);
  }
});
