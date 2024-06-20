/* eslint-disable no-undef */
import { getCookie, setCookie } from './utils.js';

async function getAnonymousPlayerInfo() {
  const res = await axios.get('/api/1.0/players/anonymous');
  return res.data;
}

async function getPlayerInfoByToken() {
  const res = await axios.get('/api/1.0/players/playerInfo');
  return res.data;
}

export async function getPlayerInfo() {
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
}

export async function setPlayerInfo() {
  const playerInfo = await getPlayerInfo();
  setCookie('playerInfo', JSON.stringify(playerInfo));
}

export async function playerInit() {
  const playerInfo = getCookie('playerInfo');

  if (!playerInfo) await setPlayerInfo();
}
