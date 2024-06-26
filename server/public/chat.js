/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
import {
  chatArea, chatContent, chatForm, messageInput, messageSendBtn
} from './dom.js';
import { socket } from './socket.js';
import { getFormattedTime } from './utils.js';
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
    const str = chatHistoryInfo.map((messageInfo) => `    
        <div class="d-flex gap-2 mb-2">
          <div class="rounded-circle bg-light p-2 lh-1 align-self-start" title="${messageInfo.nickname}">${messageInfo.nickname[0]}</div>
          <div class="rounded bg-light text-break p-2">${messageInfo.message}</div>
          <small class="align-self-end text-light">${getFormattedTime(messageInfo.create_at)}</small>
        </div>
      `).join('');
    chatContent.innerHTML = str;
    chatContent.scrollTop = chatContent.scrollHeight;
    return 'renderChatHistory Done.';
  } catch (error) {
    return error;
  }
}

async function sendNewMessage(messageInfo) {
  try {
    const url = `/api/1.0/chats/${getCurrentGameId()}`;
    const res = await axios.post(url, messageInfo);
    console.log(res);
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
