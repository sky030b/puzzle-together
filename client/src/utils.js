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

const defaultExpireSec = 4 * 60 * 60;
export function setCookie(key, value, expireSec = defaultExpireSec) {
  const expiresDate = new Date(Date.now() + expireSec * 1000);
  const expiresUTCString = expiresDate.toUTCString();
  document.cookie = `${key}=${value}; Expires=${expiresUTCString}; path=/`;
}

export function removeCookie(key) {
  const expiresDate = new Date(0);
  const expiresUTCString = expiresDate.toUTCString();
  document.cookie = `${key}=; Expires=${expiresUTCString}; path=/`;
}