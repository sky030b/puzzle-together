import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import GameCard from '../components/GameCard';

const Showcase = () => {
  const { playerId } = useParams();
  const { playerInfo } = useContext(AuthContext);

  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get(`/api/1.0/players/${playerId}/played-games`);
        setGames(res.data);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };
    fetchGames();
  }, [playerId]);

  const isOwner = playerInfo && playerInfo.playerId === playerId;

  return (
    <div className="container w-75 mt-4">
      {games.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
          <h5>{isOwner ? '目前還未遊玩任何遊戲，快來加入/創建一個吧～' : '這位玩家目前還沒有參與任何遊戲，快來邀請他一起同樂～'}</h5>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {games.map((game) => (
            <GameCard key={game.game_id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Showcase;
