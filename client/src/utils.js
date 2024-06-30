export const getRandomHexCode = () => {
  return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

export const setCookie = (name, value, days) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};
