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
  const [profileText, setProfileText] = useState('');
  const { playerInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const res = await axios.get(`/api/1.0/players/profile/${playerId}`);
        setPlayerData(res.data);
        setProfileText(res.data.profile);
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
    setProfileText(e.target.value);
  };

  const handleSaveProfile = async () => {
    try {
      await axios.post(`/api/1.0/players/profile/${playerId}`, { profile: profileText });
      setIsEditing(false);
      setPlayerData({ ...playerData, profile: profileText });
      toast.success('自我介紹已更新。', { autoClose: 1500 });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!playerData) {
    return <div>Loading...</div>;
  }

  const isOwner = playerInfo && playerInfo.playerId === playerId;

  return (
    <div className="player-profile-header d-flex">
      <div className="w-50 mx-auto">
        <div className="nickname mb-3">
          <span>暱稱：{playerData.nickname}</span>
        </div>
        <div className="player-id mb-3">
          <span className="me-3 align-middle">玩家ID：{playerData.player_id}</span>
          <button className="btn btn-outline-secondary" onClick={handleCopyPlayerId}>複製</button>
        </div>
        <div className="player-id mb-3 d-flex align-items-center">
          <span className="me-3 align-middle">代表色：</span>
          <div className="represent-color" title={playerData.represent_color} style={{ width: '20px', height: '20px', backgroundColor: playerData.represent_color }}></div>
        </div>
        <div className="profile mb-3">
          {isOwner ? (
            isEditing ? (
              <>
                <textarea className="form-control" value={profileText} onChange={handleProfileChange}></textarea>
                <button className="btn btn-outline-primary mt-2" onClick={handleSaveProfile}>儲存</button>
              </>
            ) : (
              <>
                <div style={{ whiteSpace: 'pre' }}>自我介紹：{playerData.profile || '快來加點自我介紹，讓其他人更認識你吧～'}</div>
                <button className="btn btn-outline-secondary mt-2" onClick={() => setIsEditing(true)}>編輯</button>
              </>
            )
          ) : (
            <div style={{ whiteSpace: 'pre' }}>自我介紹：{playerData.profile || '這位玩家什麼都沒有說╮(╯_╰)╭'}</div>
          )}
        </div>
      </div>
      <div className="w-50 mx-auto">
        <div className="stats mb-3">
          <div className="mb-3">參加過 {playerData.games_played} 場遊戲</div>
          <div className="mb-3">完成過 {playerData.games_completed} 場遊戲</div>
          <div className="mb-3">拼對了 {playerData.puzzles_locked} 塊拼圖</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileHeader;
