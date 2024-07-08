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

export function getFormattedTime(timestamp = Date.now()) {
  return `${new Date(timestamp).getHours().toString().padStart(2, '0')}:${new Date(timestamp).getMinutes().toString().padStart(2, '0')}`;
}

export function getFormattedNowTime() {
  const taiwanOffsetSec = 8 * 60 * 60
  return new Date(Date.now() + taiwanOffsetSec * 1000).toISOString().slice(0, 19).replace('T', ' ');
}

export function returnChatMessageFormat(messageInfo, screenIsWhos) {
  return `
    <div class="d-flex gap-2 mb-2${messageInfo.nickname === screenIsWhos ? ' flex-row-reverse' : ''}">
      <div class="rounded-circle ${messageInfo.nickname === screenIsWhos ? 'bg-primary text-light' : 'bg-light'} p-2 lh-1 align-self-start" title="${messageInfo.nickname}">${messageInfo.nickname[0]}</div>
      <div class="rounded ${messageInfo.nickname === screenIsWhos ? 'bg-primary text-light' : 'bg-light'} text-break p-2">${messageInfo.message}</div>
      <small class="align-self-end text-light">${getFormattedTime(messageInfo.create_at ? messageInfo.create_at : undefined)}</small>
    </div>
  `;
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
