/* eslint-disable no-undef */
import { getCookie, setCookie } from './utils.js';
import { setPlayerState } from './variable.js';

async function getAnonymousPlayerInfo() {
  try {
    const res = await axios.get('/api/1.0/players/anonymous');
    return res.data;
  } catch (error) {
    return error;
  }
}

async function getPlayerInfoByToken() {
  try {
    const res = await axios.get('/api/1.0/players/playerInfo');
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
    return 'playerInit Done.';
  } catch (error) {
    // 告知請重新登入
    return error;
  }
}
