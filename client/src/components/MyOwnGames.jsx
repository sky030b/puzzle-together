import { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import './style/MyOwnGames.css';

const MyOwnGames = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [hoveredGameId, setHoveredGameId] = useState(null);
  const [overlayHeight, setOverlayHeight] = useState(0);
  const { playerInfo } = useContext(AuthContext);
  const cardBodyRef = useRef(null);
  const imageContainerRef = useRef(null);

  const [formValues, setFormValues] = useState({
    gameId: '',
    title: '',
    difficulty: 'easy',
    isPublic: false
  });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get(`/api/1.0/players/${playerId}/my-own-games`);
        setGames(res.data);
      } catch (error) {
        navigate(`/profile/${playerId}/showcase`);
        console.error('Error fetching games:', error);
      }
    };
    fetchGames();
  }, [navigate, playerId]);

  useEffect(() => {
    if (cardBodyRef.current && imageContainerRef.current) {
      const totalHeight = cardBodyRef.current.clientHeight + imageContainerRef.current.clientHeight;
      setOverlayHeight(totalHeight);
    }
  }, [games]);

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

  const isOwner = playerInfo && playerInfo.playerId === playerId;

  const copyGameUrlToClipboard = (gameId) => {
    const gameUrl = `${window.location.origin}/playground.html?gameId=${gameId}`;
    navigator.clipboard.writeText(gameUrl);
    toast.success('遊戲網址已複製到剪貼簿。', { autoClose: 1500 });
  };

  const handleMouseEnter = (game) => {
    setHoveredGameId(game.game_id);
    setFormValues({
      gameId: game.game_id,
      title: game.title,
      difficulty: game.difficulty,
      isPublic: game.is_public
    });
  };

  const handleMouseLeave = () => {
    setHoveredGameId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/1.0/games/${hoveredGameId}`, {
        title: formValues.title,
        difficulty: formValues.difficulty,
        isPublic: formValues.isPublic
      });
      toast.success('遊戲資料已更新。', { autoClose: 1500 });
      const updatedGames = games.map(game =>
        game.game_id !== hoveredGameId
          ? game
          : {
            ...game,
            title: formValues.title,
            difficulty: formValues.difficulty,
            is_public: formValues.isPublic
          }
      );
      setGames(updatedGames);
    } catch (error) {
      console.error('Error updating game:', error);
      toast.error('更新遊戲資料時發生錯誤。', { autoClose: 2000 });
      console.error(error.response.data);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      await axios.delete(`/api/1.0/games/${formValues.gameId}`);
      toast.success('遊戲關卡已刪除。', { autoClose: 1500 });
      const deletedGames = games.filter((game) => game.game_id !== formValues.gameId);
      setGames(deletedGames);
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('刪除遊戲資料時發生錯誤。', { autoClose: 2000 });
      console.error(error.response.data);
    }
  };

  return (
    <div className="container w-75 mt-4">
      {games.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
          <h5>{isOwner ? '目前還未遊玩任何遊戲，快來加入/創建一個吧～' : '這位玩家目前還沒有參與任何遊戲，快來邀請他一起同樂～'}</h5>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {games.map((game) => (
              <div className="col" key={game.game_id}>
                <div className="card h-100 overflow-hidden"
                  onMouseEnter={() => handleMouseEnter(game)}
                  onMouseLeave={handleMouseLeave}>
                  <div className="position-relative overflow-hidden image-container d-flex justify-content-center align-items-center" ref={imageContainerRef} style={{ height: '300px' }}>
                    <img src={game.question_img_url} className="card-img-top img-fluid object-fit-cover h-100 w-auto rounded-0" alt="Game Image" />
                    <div className="position-absolute bottom-0 end-0 p-2 bg-light text-dark" style={{ opacity: 0.8 }}>
                      完成度：{(+game.completion_rate).toFixed(2)}%
                    </div>
                  </div>
                  <div className="card-body" ref={cardBodyRef}>
                    <h5 className="card-title">{game.title}</h5>
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
                  {hoveredGameId === game.game_id && (
                    <div className="overlay" style={{ height: `${overlayHeight}px` }}>
                      <form className="overlay-form" onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label htmlFor="rename-title" className="form-label">重新命名關卡標題</label>
                          <input
                            type="text"
                            className="form-control"
                            id="rename-title"
                            name="title"
                            value={formValues.title}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="difficulty">調整難度：</label>
                          <select
                            className="form-select"
                            name="difficulty"
                            id="difficulty"
                            value={formValues.difficulty}
                            onChange={handleInputChange}
                          >
                            <option value="easy">簡單</option>
                            <option value="medium">中等</option>
                            <option value="hard">困難</option>
                          </select>
                        </div>
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="is_public"
                            name="isPublic"
                            checked={formValues.isPublic}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="is_public">
                            開放所有玩家加入
                          </label>
                        </div>
                        <button type="submit" className="save-change-btn btn btn-primary w-100">儲存變更</button>
                        <hr />
                        <button type="button" className="delete-game-btn btn btn-danger w-100" data-bs-toggle="modal" data-bs-target="#deleteGameConfirm" >刪除遊戲關卡</button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="modal fade" id="deleteGameConfirm" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">確認刪除</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <p>您確定要刪除 <strong>{formValues.title}</strong> 嗎？此操作將無法撤銷。</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete} data-bs-dismiss="modal">確定刪除</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyOwnGames;
