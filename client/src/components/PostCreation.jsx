import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import { getCookie } from '../utils';

const PostCreation = ({ playerId, onCreatePost }) => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/1.0/players/${playerId}/played-games`, {
        headers: {
          'Authorization': `Bearer ${getCookie('token')}`
        }
      });
      setGames(res.data);
      setFilteredGames(res.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilteredGames(
      games.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, games]);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleSubmit = async () => {
    if (!selectedGame || postContent.length > 150) {
      // alert('請確認是否有選取一個相關關卡並確認發文內容少於150個字。');
      return;
    }

    const newPostData = {
      id: Date.now().toString(),
      playerId,
      gameId: selectedGame.game_id,
      content: postContent,
      comments: [],
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/1.0/posts`, {
        gameId: selectedGame.game_id,
        content: postContent
      }, {
        headers: {
          'Authorization': `Bearer ${getCookie('token')}`
        }
      });
      // alert('Post created successfully!');
      setShowModal(false);
      onCreatePost(newPostData);
      setPostContent('');
      setSelectedGame(null);
      setSearchTerm('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center mb-4">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          建立貼文
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>選擇一個拼圖關卡並為此撰寫一篇貼文</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>搜尋遊戲</Form.Label>
            <Form.Control
              type="text"
              placeholder="透過關卡標題搜尋"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
          {isLoading ? (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <ListGroup>
              {filteredGames.map(game => (
                <ListGroup.Item
                  key={game.game_id}
                  active={selectedGame && selectedGame.game_id === game.game_id}
                  onClick={() => handleGameSelect(game)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-4">
                    <img src={game.question_img_url} className="mx-auto img-fluid object-fit-cover" alt="Game Thumbnail" style={{ width: "100px", height: "100px", marginRight: "10px" }} />
                    <div className="w-100">
                      <div className="row">
                        <div className="col-4"><strong>標題：</strong>{game.title}</div>
                        <div className="col-4"><strong>建立者：</strong>{game.owner_nickname}</div>
                        <div className="col-4"><strong>難度：</strong>{game.difficulty === 'easy' ? '簡單' : game.difficulty === 'medium' ? '中等' : '困難'}</div>
                      </div>
                      <div className="row">
                        <div className="col-4"><strong>完成度：</strong>{(+game.completion_rate).toFixed(2)}%</div>
                        <div className="col-4"><strong>片數：</strong>{game.row_qty} x {game.col_qty}</div>
                        <div className="col-4"><strong>是否公開：</strong>{game.is_public ? "Yes" : "No"}</div>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          <Form.Group className="mt-3">
            <Form.Label>貼文內容</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              maxLength={150}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            <Form.Text className="text-muted">
              {postContent.length} / 150 字
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            捨棄
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            發文
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PostCreation;
