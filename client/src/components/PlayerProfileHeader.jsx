import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PlayerProfileHeader = () => {
  const { playerId } = useParams();
  const [playerData, setPlayerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileText, setProfileText] = useState('');

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await axios.get(`/api/1.0/players/profile/${playerId}`);
        setPlayerData(response.data);
        setProfileText(response.data.profile);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching player data:', error);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  const handleCopyPlayerId = () => {
    navigator.clipboard.writeText(playerData.player_id);
    alert('Player ID copied to clipboard!');
  };

  const handleProfileChange = (e) => {
    setProfileText(e.target.value);
  };

  const handleSaveProfile = async () => {
    try {
      await axios.post(`/api/1.0/players/profile/${playerId}`, { profile: profileText });
      setIsEditing(false);
      setPlayerData({ ...playerData, profile: profileText });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!playerData) {
    return <div>Loading...</div>;
  }

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
          <div className="represent-color" style={{ width: '20px', height: '20px', backgroundColor: playerData.represent_color }}></div>
        </div>
        <div className="profile mb-3">
          {isEditing ? (
            <>
              <textarea className="form-control" value={profileText} onChange={handleProfileChange}></textarea>
              <button className="btn btn-outline-primary mt-2" onClick={handleSaveProfile}>儲存</button>
            </>
          ) : (
            <>
              <div style={{ whiteSpace: 'pre' }}>自我介紹：{playerData.profile}</div>
              <button className="btn btn-outline-secondary mt-2" onClick={() => setIsEditing(true)}>編輯</button>
            </>
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
