/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
import {
  chatArea, chatContent, chatForm, messageInput, messageSendBtn
} from './dom.js';
import { socket } from './socket.js';
import { returnChatMessageFormat } from './utils.js';
import { getCurrentGameId, getPlayerState, setIsInsideChatArea } from './variable.js';

chatArea.addEventListener('mouseenter', () => {
  setIsInsideChatArea(true);
});

chatArea.addEventListener('mouseleave', () => {
  setIsInsideChatArea(false);
});

async function getChatHistory() {
  const url = `/api/1.0/chats/${getCurrentGameId()}`;
  const res = await axios.get(url);
  const chatHistoryInfo = res.data;

  return chatHistoryInfo;
}

export default async function renderChatHistory() {
  try {
    const chatHistoryInfo = await getChatHistory();
    const str = chatHistoryInfo.map(
      (messageInfo) => returnChatMessageFormat(messageInfo, getPlayerState().nickname)
    ).join('');
    chatContent.innerHTML = str;
    chatContent.scrollTop = chatContent.scrollHeight;
    chatContent.classList.add('d-none');
    chatForm.classList.add('d-none');
    chatArea.addEventListener('mouseover', (e) => {
      e.preventDefault();
      chatContent.classList.remove('d-none');
      chatForm.classList.remove('d-none');
    })
    chatArea.addEventListener('mouseout', (e) => {
      e.preventDefault();
      chatContent.classList.add('d-none');
      chatForm.classList.add('d-none');
    })
    return 'renderChatHistory Done.';
  } catch (error) {
    return error;
  }
}

async function sendNewMessage(messageInfo) {
  try {
    const url = `/api/1.0/chats/${getCurrentGameId()}`;
    const res = await axios.post(url, messageInfo);
  } catch (error) {
    alert(error.response.data);
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const { playerId, nickname } = getPlayerState();

  if (!playerId) {
    alert('請先登入才可使用即時聊天系統！！');
    chatForm.reset();
    messageInput.disabled = true;
    messageSendBtn.disabled = true;
    return;
  }

  if (!chatForm[0].value.trim()) {
    chatForm.reset();
    return;
  }

  const messageInfo = {
    playerId,
    message: chatForm[0].value.trim()
  };

  socket.emit('sendNewMessage', {
    ...messageInfo,
    nickname,
    gameId: getCurrentGameId()
  });

  await sendNewMessage(messageInfo);
  chatForm.reset();
});
