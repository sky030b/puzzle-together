export function getRandomHexCode() {
  let hexCode = Math.floor(Math.random() * 0xFFFFFF).toString(16);
  while (hexCode.length < 6) {
    hexCode = '0' + hexCode;
  }
  return hexCode;
}

export async function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height, src: url, scale: 1 });
    };
    img.onerror = reject;
    img.src = url;
  });
}
