/* eslint-disable no-undef */
import { sendInviteBtn } from './dom.js';
import { getCookie } from './utils.js';
import { API_BASE_URL, getCurrentGameId, getPlayerState } from './variable.js';

const inviteForm = document.querySelector('#invite-form');
const sendPlayerInvite = async (e) => {
  e.preventDefault();
  try {
    const { playerId: inviterId } = getPlayerState();
    if (!inviterId) {
      Toastify({
        text: '請先登入才可邀請其他玩家一同遊玩！',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#e74c3c',
        stopOnFocus: true
      }).showToast();
      return;
    }

    const inviteInfo = {
      inviterId,
      inviteeId: inviteForm[0].value.trim(),
      gameId: getCurrentGameId()
    };
    await axios.post(`${API_BASE_URL}/api/1.0/players/invite`, inviteInfo, {
      headers: {
        Authorization: `Bearer ${getCookie('token')}`
      }
    });
    Toastify({
      text: `邀請成功：${inviteForm[0].value}`,
      duration: 1500,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: 'green',
      stopOnFocus: true
    }).showToast();

    inviteForm.reset();
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
};
inviteForm.addEventListener('submit', sendPlayerInvite);

sendInviteBtn.addEventListener('click', sendPlayerInvite);
