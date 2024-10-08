import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import GameCard from '../components/GameCard';
import { getCookie } from '../utils';

const AllGamesPage = () => {
  const { playerId } = useParams();

  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/1.0/games/public`, {
          headers: {
            'Authorization': `Bearer ${getCookie('token')}`
          }
        });
        setGames(res.data);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    document.title = '帕索兔蓋德 - 關卡總覽';
    fetchGames();
  }, [playerId]);

  return (
    <div className="container w-75 my-4">
      <h2 className="text-center">公開關卡總覽</h2>
      <hr className="my-4" />
      <div className="row row-cols-1 row-cols-md-3 g-4 mb-4">
        {games.map((game) => (
          <GameCard key={game.game_id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default AllGamesPage;
