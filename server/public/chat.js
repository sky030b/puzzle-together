/* eslint-disable import/no-cycle */
/* eslint-disable no-console */
/* eslint-disable no-undef */
import {
  chatArea, chatContent, chatForm, messageInput, messageSendBtn
} from './dom.js';
import { socket } from './socket.js';
import { getCookie, returnChatMessageFormat } from './utils.js';
import {
  API_BASE_URL, getCurrentGameId, getPlayerState, setIsInsideChatArea
} from './variable.js';

chatArea.addEventListener('mouseenter', () => {
  setIsInsideChatArea(true);
});

chatArea.addEventListener('mouseleave', () => {
  setIsInsideChatArea(false);
});

async function getChatHistory() {
  const url = `${API_BASE_URL}/api/1.0/chats/${getCurrentGameId()}`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${getCookie('token')}`
    }
  });
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
    });
    chatArea.addEventListener('mouseleave', (e) => {
      e.preventDefault();
      chatContent.classList.add('d-none');
      chatForm.classList.add('d-none');
    });
    return 'renderChatHistory Done.';
  } catch (error) {
    return error;
  }
}

async function sendNewMessage(messageInfo) {
  try {
    const url = `${API_BASE_URL}/api/1.0/chats/${getCurrentGameId()}`;
    await axios.post(url, messageInfo, {
      headers: {
        Authorization: `Bearer ${getCookie('token')}`
      }
    });
  } catch (error) {
    Toastify({
      text: error.response.data,
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#e74c3c',
      stopOnFocus: true
    }).showToast();
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const { playerId, nickname } = getPlayerState();

  if (!playerId) {
    Toastify({
      text: '請先登入才可使用即時聊天系統！！',
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#e74c3c',
      stopOnFocus: true
    }).showToast();

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
