export function getRandomHexCode() {
  let hexCode = Math.floor(Math.random() * 0xFFFFFF).toString(16);
  while (hexCode.length < 6) {
    hexCode = `0${hexCode}`;
  }
  return hexCode;
}

export function getCookie(key) {
  const str = `; ${document.cookie}`.split(`; ${key}=`);
  if (str.length === 2) return str.pop().split(';').shift();
  return undefined;
}

export function setCookie(key, value, expireSec = 4 * 60 * 60) {
  const expiresDate = new Date(Date.now() + expireSec * 1000);
  const expiresUTCString = expiresDate.toUTCString();
  document.cookie = `${key}=${value}; Expires=${expiresUTCString}`;
}