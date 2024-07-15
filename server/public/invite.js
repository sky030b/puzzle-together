import { sendInviteBtn } from './dom.js';
import { getCurrentGameId, getPlayerState } from './variable.js';

const inviteForm = document.querySelector('#invite-form');
const sendPlayerInvite = async (e) => {
  e.preventDefault();
  try {
    const { playerId: inviterId } = getPlayerState();
    if (!inviterId) return Toastify({
      text: '請先登入才可邀請其他玩家一同遊玩！',
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "red",
      stopOnFocus: true
    }).showToast();

    const inviteInfo = {
      inviterId,
      inviteeId: inviteForm[0].value.trim(),
      gameId: getCurrentGameId()
    }
    const res = await axios.post('/api/1.0/players/invite', inviteInfo);
    Toastify({
      text: '邀請成功：' + inviteForm[0].value,
      duration: 1500,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "green",
      stopOnFocus: true
    }).showToast();

    inviteForm.reset();
  } catch (error) {
    Toastify({
      text: error.response.data,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "red",
      stopOnFocus: true
    }).showToast();
  }
};
inviteForm.addEventListener('submit', sendPlayerInvite);

sendInviteBtn.addEventListener('click', sendPlayerInvite);  