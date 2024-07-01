import { sendInviteBtn } from "./dom";

const inviteForm = document.querySelector('#invite-form');
const sendPlayerInvite = (e) => {
  e.preventDefault();
  alert('邀請成功：' + inviteForm[0].value);
  inviteForm.reset();
};
inviteForm.addEventListener('submit', sendPlayerInvite);

sendInviteBtn.addEventListener('click', sendPlayerInvite);  