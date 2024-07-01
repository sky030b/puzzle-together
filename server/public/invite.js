import { sendInviteBtn } from './dom.js';
import { getCurrentGameId, getPlayerState } from './variable.js';

const inviteForm = document.querySelector('#invite-form');
const sendPlayerInvite = async (e) => {
  e.preventDefault();
  try {
    const { playerId: inviterId } = getPlayerState();
    if (!inviterId) return alert('請先登入才可邀請其他玩家一同遊玩！');
    const inviteInfo = {
      inviterId,
      inviteeId: inviteForm[0].value.trim(),
      gameId: getCurrentGameId()
    }
    const res = await axios.post('/api/1.0/players/invite', inviteInfo);
    console.log(res.data);
    alert('邀請成功：' + inviteForm[0].value);
    inviteForm.reset();
  } catch (error) {
    alert(error.response.data);
  }
};
inviteForm.addEventListener('submit', sendPlayerInvite);

sendInviteBtn.addEventListener('click', sendPlayerInvite);  