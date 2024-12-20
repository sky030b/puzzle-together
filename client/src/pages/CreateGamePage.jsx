import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCookie, removeCookie } from '../utils';
import { AuthContext } from '../contexts/AuthContext';

const CreateGamePage = () => {
  const { setPlayerInfo, setIsAuthenticated } = useContext(AuthContext);

  const [formValues, setFormValues] = useState({
    owner_id: '',
    title: '',
    question_img: null,
    row_qty: 4,
    col_qty: 4,
    mode: 'cooperation',
    difficulty: 'easy',
    is_public: false,
    is_open_when_owner_not_in: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormValues({ ...formValues, [name]: checked });
    } else if (type === 'file') {
      setFormValues({ ...formValues, [name]: files[0] });
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      for (const key in formValues) {
        formData.append(key, formValues[key]);
      }
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/1.0/games/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${getCookie('token')}`
        },
      });
      if (res instanceof Error) throw res;
      window.location.href = `/playground.html?gameId=${res.data.game_id}`;
    } catch (error) {
      console.error(error);
      toast.error(error.response.data, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const setOwnerId = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/1.0/players/playerInfo`, {
          headers: {
            'Authorization': `Bearer ${getCookie('token')}`
          }
        });
        const playerInfo = res.data;
        setFormValues((prevValues) => ({
          ...prevValues,
          owner_id: playerInfo.playerId
        }));
      } catch (error) {
        console.error(error.response.data);
        removeCookie('token');
        setIsAuthenticated(false);
        setPlayerInfo({});
        toast.error('尚未登入或是登入階段已過期，請重新登入。', { autoClose: 2000 });
        navigate('/signin');
      }
    };

    document.title = '帕索兔蓋德 - 建立遊戲';
    setOwnerId();
  }, [setIsAuthenticated, setPlayerInfo, navigate]);

  return (
    <div className="container-bg py-5 d-flex justify-content-center align-items-center">
      {loading && (
        <div className="overlay-full">
          <div className="spinner"></div>
        </div>
      )}
      <div className='w-75 mx-auto'>
        <h2 className="text-center mb-5">快來建立自己的拼圖遊戲吧 ～</h2>
        <form id="game-form" className="game-form" onSubmit={handleSubmit}>
          <input type="hidden" name="owner_id" value={formValues.owner_id} />
          <div className="row g-3">
            <div className="col-6">
              <label htmlFor="title" className="col-form-label">遊戲關卡標題：</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formValues.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-6">
              <label htmlFor="question_img" className="col-form-label">遊戲題目圖片：</label>
              <input
                type="file"
                className="form-control"
                id="question_img"
                name="question_img"
                accept="image/*"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-6">
              <label htmlFor="rows" className="col-form-label">列數：</label>
              <input
                type="number"
                className="form-control"
                id="rows"
                name="row_qty"
                value={formValues.row_qty}
                min="1"
                max="40"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-6">
              <label htmlFor="cols" className="col-form-label">行數：</label>
              <input
                type="number"
                className="form-control"
                id="cols"
                name="col_qty"
                value={formValues.col_qty}
                min="1"
                max="40"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label me-3" htmlFor="difficulty">難度：</label>
              <button type="button" className="btn btn-secondary rounded-circle px-1 py-0" data-bs-toggle="modal" data-bs-target="#exampleModal">
                ？
              </button>
              <select
                className="form-select"
                name="difficulty"
                id="difficulty"
                value={formValues.difficulty}
                onChange={handleChange}
              >
                <option value="easy">簡單</option>
                <option value="medium">中等</option>
                <option value="hard">困難</option>
              </select>
            </div>
            <div className="col-auto align-self-end">
              <input
                type="checkbox"
                className="form-check-input me-2"
                id="is_public"
                name="is_public"
                checked={formValues.is_public}
                onChange={handleChange}
              />
              <label className="form-label form-check-label" htmlFor="is_public">
                開放所有玩家加入
              </label>
            </div>
            <button type="submit" className="btn btn-primary mt-5" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  正在處理...
                </>
              ) : (
                '開始玩'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">難度介紹</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              簡單：<br />有格線、較清楚的底圖提示、拼對時鎖定拼圖、靠近正確目標格放開時吸入<br /><br />
              中等：<br />無格線、較淺色的底圖提示、拼對時鎖定拼圖、靠近<strong className="text-danger">任意</strong>目標格放開時吸入<br /><br />
              困難：<br />無格線、完全沒有底圖提示、拼對<strong className="text-danger">不</strong>鎖定拼圖、靠近<strong className="text-danger">任意</strong>目標格放開時吸入、有手動查看提示功能
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGamePage;
