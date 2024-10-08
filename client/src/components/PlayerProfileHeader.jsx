import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import { getCookie } from '../utils';
import './style/PlayerProfileHeader.css';

const PlayerProfileHeader = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState('');
  const [representColor, setRepresentColor] = useState('');
  const { playerInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/1.0/players/profile/${playerId}`, {
          headers: {
            'Authorization': `Bearer ${getCookie('token')}`
          }
        });
        setPlayerData(res.data);
        setProfile(res.data.profile);
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

  const handleRepresentColorChange = (e) => {
    setRepresentColor(e.target.value);
  };

  const handleSaveProfile = async () => {
    try {
      if (representColor === playerData.represent_color && profile === playerData.profile) return setIsEditing(false);
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/1.0/players/profile/${playerId}`, {
        representColor,
        profile
      }, {
        headers: {
          'Authorization': `Bearer ${getCookie('token')}`
        }
      });
      setIsEditing(false);
      setPlayerData({
        ...playerData,
        represent_color: representColor,
        profile
      });
      toast.success('資料已更新，新代表色將於重新登入後生效。', { autoClose: 1500 });
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
        <div className='nickname mb-3'>
          <span className='me-3 text-nowrap'>玩家暱稱：</span>
          <span>{playerData.nickname}</span>
        </div>
        <div className='player-id mb-2'>
          <span className='me-3 text-nowrap'>玩家編號：</span>
          <span className='me-3'>{playerData.player_id}</span>
          <button className='btn btn-outline-secondary' onClick={handleCopyPlayerId}>複製</button>
        </div>
        <div className='player-id mb-3 d-flex align-items-center'>
          {isOwner && isEditing ? (
            <>
              <span className='me-3 align-middle text-nowrap'>代表顏色：</span>
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
              <span className='me-3 align-middle text-nowrap'>代表顏色：</span>
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
                  <div className='me-3 text-nowrap'>自我介紹：</div>
                  <div className='w-100'>
                    <textarea
                      className='form-control mb-3'
                      rows='5'
                      value={profile}
                      onChange={handleProfileChange}
                      onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === 'Enter') {
                          handleSaveProfile(); // 觸發儲存功能
                        }
                      }}
                    ></textarea>
                    <button className='btn btn-outline-primary' onClick={handleSaveProfile}>儲存</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className='d-flex mb-3'>
                  <div className='me-3 text-nowrap'>自我介紹：</div>
                  <div className='w-100'>
                    <div className='mb-3 text-break intro-text'>
                      {playerData.profile || '快來加點自我介紹，讓其他人更認識你吧～'}
                    </div>
                    <button className='btn btn-outline-secondary' onClick={() => setIsEditing(true)}>編輯</button>
                  </div>
                </div>
              </>
            )
          ) : (
            <div className='d-flex mb-3'>
              <div className='me-3 text-nowrap'>自我介紹：</div>
              <div className='text-break intro-text'>
                {playerData.profile || '這位玩家什麼都沒有說╮(╯_╰)╭'}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='w-25 d-flex justify-content-center align-items-center'>
        <div className='stats mb-3 d-flex flex-column align-items-center'>
          <div className='mb-3 text-center text-nowrap'>參加過 <strong>{playerData.games_played}</strong> 場遊戲</div>
          <div className='mb-3 text-center text-nowrap'>完成過 <strong>{playerData.games_completed}</strong> 場遊戲</div>
          <div className='mb-3 text-center text-nowrap'>拼對了 <strong>{playerData.puzzles_locked}</strong> 塊拼圖</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileHeader;
