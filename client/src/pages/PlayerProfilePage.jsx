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
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!playerData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="player-profile-header">
      <div className="player-id mb-3">
        <span className="me-3 align-middle">玩家ID：{playerData.player_id}</span>
        <button className="btn btn-outline-secondary" onClick={handleCopyPlayerId}>複製</button>
      </div>
      <div className="email mb-3">
        <span>信箱：{playerData.email}</span>
        {/* Add functionality to toggle email visibility if needed */}
      </div>
      <div className="nickname mb-3">
        <span>暱稱：{playerData.nickname}</span>
      </div>
      <div className="represent-color mb-3" style={{ backgroundColor: playerData.represent_color }}>
        代表色
      </div>
      <div className="stats mb-3">
        <div>參加過 {playerData.games_played} 場遊戲</div>
        <div>完成過 {playerData.games_completed} 場遊戲</div>
        <div>拼對了 {playerData.puzzles_locked} 塊拼圖</div>
      </div>
      <div className="profile mb-3">
        {isEditing ? (
          <>
            <textarea className="form-control" value={profileText} onChange={handleProfileChange}></textarea>
            <button onClick={handleSaveProfile}>儲存</button>
          </>
        ) : (
          <>
            <div style={{ whiteSpace: 'pre' }}>自我介紹：{playerData.profile}</div>
            <button onClick={() => setIsEditing(true)}>編輯</button>
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerProfileHeader;
