import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllGamesPage = () => {
  const { playerId } = useParams();

  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get('/api/1.0/games/public');
        setGames(res.data);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    document.title = '帕索兔蓋德 - 關卡總覽';
    fetchGames();
  }, [playerId]);

  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success';
      case 'medium':
        return 'bg-warning text-dark';
      case 'hard':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getPublicStatusBadgeClass = (isPublic) => {
    return isPublic ? 'bg-success' : 'bg-secondary';
  };

  const formatPlayDuration = (playDurationSec) => {
    const day = Math.floor(playDurationSec / 86400);
    const hr = Math.floor((playDurationSec % 86400) / 3600);
    const min = Math.floor((playDurationSec % 3600) / 60);
    const sec = Math.floor(playDurationSec % 60);
    return `${day ? `${day}天` : ''}${hr ? `${hr.toString().padStart(2, '0')}時` : ''}${min ? `${min.toString().padStart(2, '0')}分` : ''}${sec.toString().padStart(2, '0')}秒`;
  };

  const copyGameUrlToClipboard = (gameId) => {
    const gameUrl = `${window.location.origin}/playground.html?gameId=${gameId}`;
    navigator.clipboard.writeText(gameUrl);
    toast.success('遊戲網址已複製到剪貼簿。', { autoClose: 1500 });
  };

  return (
    <div className="container w-75 my-4">
      <h2 className="text-center">公開關卡總覽</h2>
      <hr className="my-4" />
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {games.map((game) => (
          <div className="col" key={game.game_id}>
            <div className="card h-100">
              <div className="position-relative overflow-hidden image-container d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <img src={game.question_img_url} className="card-img-top img-fluid object-fit-cover h-100 w-auto" alt="Game Image" />
                <div className="position-absolute bottom-0 end-0 p-2 bg-light text-dark" style={{ opacity: 0.8 }}>
                  完成度：{(+game.completion_rate).toFixed(2)}%
                </div>
              </div>
              <div className="card-body">
                <h5 className="card-title">{game.title}</h5>
                <p className="card-text">創建者：<Link to={`/profile/${game.owner_id}/showcase`}>{game.owner_nickname}</Link></p>
                <div className="d-flex flex-wrap mb-2">
                  <span className="badge rounded-pill bg-primary me-2">{game.row_qty} × {game.col_qty}</span>
                  <span className={`badge rounded-pill ${getDifficultyBadgeClass(game.difficulty)} me-2`}>
                    {game.difficulty === 'easy' ? '簡單' : game.difficulty === 'medium' ? '中等' : '困難'}
                  </span>
                  <span className={`badge rounded-pill ${getPublicStatusBadgeClass(game.is_public)}`}>
                    {game.is_public ? '公開' : '私人'}
                  </span>
                </div>
                <p className="card-text">遊戲時長：{formatPlayDuration(game.play_duration)}</p>
              </div>
              <div className="card-footer d-flex justify-content-between">
                <button className="copy-game-url-btn btn btn-outline-primary" onClick={() => copyGameUrlToClipboard(game.game_id)}>複製遊戲網址</button>
                <Link to={`/playground.html?gameId=${game.game_id}`} target="_blank" className="btn btn-primary">進入遊戲</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllGamesPage;
