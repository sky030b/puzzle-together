import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';

const PlayerProfileHeader = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState('');
  const [nickname, setNickname] = useState('');
  const [representColor, setRepresentColor] = useState('');
  const { playerInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const res = await axios.get(`/api/1.0/players/profile/${playerId}`);
        setPlayerData(res.data);
        setProfile(res.data.profile);
        setNickname(res.data.nickname);
        setRepresentColor(res.data.represent_color);
      } catch (error) {
        console.error('Error fetching player data:', error);
        toast.error(error.response.data, { autoClose: 2000 });
        navigate('/not-found');
      }
    };

    fetchPlayerData();
  }, [navigate, playerId]);

  const handleCopyPlayerId = () => {
    navigator.clipboard.writeText(playerData.player_id);
    toast.success('玩家 ID 已複製到剪貼簿。', { autoClose: 1500 });
  };

  const handleProfileChange = (e) => {
    setProfile(e.target.value);
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const handleRepresentColorChange = (e) => {
    setRepresentColor(e.target.value);
  };

  const handleSaveProfile = async () => {
    try {
      await axios.post(`/api/1.0/players/profile/${playerId}`, {
        profile,
        nickname,
        representColor
      });
      setIsEditing(false);
      setPlayerData({
        ...playerData,
        profile,
        nickname,
        representColor
      });
      toast.success('資料已更新。', { autoClose: 1500 });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response.data, { autoClose: 2000 });
    }
  };

  if (!playerData) {
    return <div>Loading...</div>;
  }

  const isOwner = playerInfo && playerInfo.playerId === playerId;

  return (
    <div className='player-profile-header d-flex'>
      <div className='w-75 mx-auto'>
        <div className='player-id mb-2'>
          <span className='me-3'>玩家編號：</span>
          <span className='me-3'>{playerData.player_id}</span>
          <button className='btn btn-outline-secondary' onClick={handleCopyPlayerId}>複製</button>
        </div>
        <div className='nickname mb-3'>
          {isOwner && isEditing ? (
            <div className='d-flex align-items-center'>
              <div className='me-3' style={{ whiteSpace: 'nowrap' }}>玩家暱稱：</div>
              <input
                type='text'
                className='form-control'
                value={nickname}
                onChange={handleNicknameChange}
              />
            </div>
          ) : (
            <>
              <span className='me-3'>玩家暱稱：</span>
              <span>{playerData.nickname}</span>
            </>
          )}
        </div>
        <div className='player-id mb-3 d-flex align-items-center'>
          {isOwner && isEditing ? (
            <>
              <span className='me-3 align-middle'>代表顏色：</span>
              <input
                type='color'
                className='form-control form-control-color'
                value={representColor}
                onChange={handleRepresentColorChange}
                title='選擇代表色'
              />
            </>
          ) : (
            <>
              <span className='me-3 align-middle'>代表顏色：</span>
              <div
                className='represent-color'
                title={playerData.represent_color}
                style={{ width: '20px', height: '20px', backgroundColor: playerData.represent_color }}
              ></div>
            </>
          )}
        </div>
        <div className='profile mb-3'>
          {isOwner ? (
            isEditing ? (
              <>
                <div className='d-flex'>
                  <div className='me-3' style={{ whiteSpace: 'nowrap' }}>自我介紹：</div>
                  <textarea
                    className='form-control'
                    rows='3'
                    value={profile}
                    onChange={handleProfileChange}
                  ></textarea>
                </div>
                <button className='btn btn-outline-primary mt-2' onClick={handleSaveProfile}>儲存</button>
              </>
            ) : (
              <>
                <div className='d-flex'>
                  <div className='me-3' style={{ whiteSpace: 'nowrap' }}>自我介紹：</div>
                  <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
                    {playerData.profile || '快來加點自我介紹，讓其他人更認識你吧～'}
                  </div>
                </div>
                <button className='btn btn-outline-secondary mt-2' onClick={() => setIsEditing(true)}>編輯</button>
              </>
            )
          ) : (
            <div className='d-flex'>
              <div style={{ whiteSpace: 'nowrap' }}>自我介紹：</div>
              <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
                {playerData.profile || '這位玩家什麼都沒有說╮(╯_╰)╭'}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='w-25 d-flex justify-content-center align-items-center'>
        <div className='stats mb-3 d-flex flex-column align-items-center'>
          <div className='mb-3 text-center'>參加過 {playerData.games_played} 場遊戲</div>
          <div className='mb-3 text-center'>完成過 {playerData.games_completed} 場遊戲</div>
          <div className='mb-3 text-center'>拼對了 {playerData.puzzles_locked} 塊拼圖</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileHeader;
