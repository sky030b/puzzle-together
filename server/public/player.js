/* eslint-disable no-undef */
// tool
function getCookie(key) {
  const str = `; ${document.cookie}`.split(`; ${key}=`);
  if (str.length === 2) return JSON.parse(str.pop().split(';').shift());
  return undefined;
}

function setCookie(key, value) {
  const expiresDate = new Date(Date.now() + 4 * 60 * 60 * 1000);
  const expiresUTCString = expiresDate.toUTCString();
  document.cookie = `${key}=${JSON.stringify(value)}; Expires=${expiresUTCString}`;
}

async function getAnonymousPlayerInfo() {
  const res = await axios.get('/api/1.0/players/anonymous');
  return res.data;
}

export async function getPlayerInfo() {
  const playerInfo = getCookie('playerInfo');
  if (playerInfo) return playerInfo;

  let fetchedPlayerInfo;
  const token = getCookie('token');
  if (token) {
    console.log('exist');
    // getPlayerInfoByToken
  } else {
    fetchedPlayerInfo = await getAnonymousPlayerInfo();
  }
  return fetchedPlayerInfo;
}

export async function setPlayerInfo() {
  const playerInfo = await getPlayerInfo();
  setCookie('playerInfo', playerInfo);
}

export async function playerInit() {
  const playerInfo = getCookie('playerInfo');

  if (!playerInfo) await setPlayerInfo();
}
