/* eslint-disable no-undef */
import {
  invitePlayerInput, messageInput, messageSendBtn, sendInviteBtn
} from './dom.js';
import { getCookie } from './utils.js';
import { API_BASE_URL, getPlayerState, setPlayerState } from './variable.js';

async function getAnonymousPlayerInfo() {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/1.0/players/anonymous`);
    return res.data;
  } catch (error) {
    return error;
  }
}

async function getPlayerInfoByToken() {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/1.0/players/playerInfo`, {
      headers: {
        Authorization: `Bearer ${getCookie('token')}`
      }
    });
    return res.data;
  } catch (error) {
    return error;
  }
}

async function getPlayerInfo() {
  try {
    let fetchedPlayerInfo;
    const token = getCookie('token');
    if (token) {
      fetchedPlayerInfo = await getPlayerInfoByToken();
    } else {
      const playerInfo = getCookie('playerInfo');
      if (playerInfo) return JSON.parse(playerInfo);

      fetchedPlayerInfo = await getAnonymousPlayerInfo();
    }
    if (fetchedPlayerInfo instanceof Error) throw fetchedPlayerInfo;

    return fetchedPlayerInfo;
  } catch (error) {
    return error;
  }
}

export default async function initPlayer() {
  try {
    const playerInfo = await getPlayerInfo();
    if (playerInfo instanceof Error) throw playerInfo;
    setPlayerState(playerInfo);
    // setCookie('playerInfo', JSON.stringify(playerInfo));
    if (getPlayerState().playerId) {
      messageInput.placeholder = '說點什麼吧';
      messageInput.disabled = false;
      messageSendBtn.disabled = false;

      invitePlayerInput.placeholder = '邀請好友一同遊玩～';
      invitePlayerInput.disabled = false;
      sendInviteBtn.textContent = '寄送邀請';
      sendInviteBtn.disabled = false;

      const twoWayToGoBtn = document.querySelector('.two-way-to-go');
      twoWayToGoBtn.textContent = '回我的展示櫃';
      twoWayToGoBtn.href = `/profile/${getPlayerState().playerId}/showcase`;
    }
    return 'playerInit Done.';
  } catch (error) {
    // 告知請重新登入
    return error;
  }
}
