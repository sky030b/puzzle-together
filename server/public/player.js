/* eslint-disable no-undef */
import { getCookie, setCookie } from './utils.js';

async function getAnonymousPlayerInfo() {
  try {
    const res = await axios.get('/api/1.0/players/anonymous');
    return res.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getPlayerInfoByToken() {
  try {
    const res = await axios.get('/api/1.0/players/playerInfo');
    return res.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function getPlayerInfo() {
  try {
    const playerInfo = getCookie('playerInfo');
    if (playerInfo) return JSON.stringify(playerInfo);

    let fetchedPlayerInfo;
    const token = getCookie('token');
    if (token) {
      fetchedPlayerInfo = await getPlayerInfoByToken();
    } else {
      fetchedPlayerInfo = await getAnonymousPlayerInfo();
    }
    return fetchedPlayerInfo;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function setPlayerInfo() {
  try {
    const playerInfo = await getPlayerInfo();
    if (playerInfo instanceof Error) throw playerInfo;

    setCookie('playerInfo', JSON.stringify(playerInfo));
    return 'setPlayerInfo Done.';
  } catch (error) {
    // 告知請重新登入
    console.error(error);
    return error;
  }
}

export async function playerInit() {
  try {
    const playerInfo = getCookie('playerInfo');
    if (!playerInfo) await setPlayerInfo();
    return 'playerInit Done.';
  } catch (error) {
    console.error(error);
    return error;
  }
}
