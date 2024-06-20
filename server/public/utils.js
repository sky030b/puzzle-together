export function getRandomHexCode() {
  let hexCode = Math.floor(Math.random() * 0xFFFFFF).toString(16);
  while (hexCode.length < 6) {
    hexCode = `0${hexCode}`;
  }
  return hexCode;
}

export async function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        src: url,
        scale: 1
      });
    };
    img.onerror = reject;
    img.src = url;
  });
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
