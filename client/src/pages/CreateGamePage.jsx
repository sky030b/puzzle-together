import { useState } from 'react';
import axios from 'axios';

const CreateGamePage = () => {
  const [formValues, setFormValues] = useState({
    owner_id: 'player123',
    title: '',
    question_img: null,
    row_qty: 4,
    col_qty: 4,
    mode: 'cooperation',
    difficulty: 'easy',
    is_public: false,
    is_open_when_owner_not_in: false,
  });

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
    try {
      const formData = new FormData();
      for (const key in formValues) {
        formData.append(key, formValues[key]);
      }
      const res = await axios.post('/api/1.0/games/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res instanceof Error) throw res;
      window.location.href = `/playground.html?gameId=${res.data.game_id}`;
    } catch (error) {
      console.error(error);
      alert(error.response.data);
    }
  };

  return (
    <div className="container-bg py-5 d-flex justify-content-center align-items-center">
      <div className='w-75 mx-auto'>
        <h2 className="text-center mb-5">快來創建自己的拼圖遊戲吧 ～</h2>
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
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="mode">模式：</label>
              <select
                className="form-select"
                name="mode"
                id="mode"
                value={formValues.mode}
                onChange={handleChange}
              >
                <option value="cooperation">合作模式</option>
                <option value="competition">競賽模式</option>
                <option value="relay">接力模式</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="difficulty">難度：</label>
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
            <div className="col-auto">
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
            <div className="col-auto">
              <input
                type="checkbox"
                className="form-check-input me-2"
                id="is_open_when_owner_not_in"
                name="is_open_when_owner_not_in"
                checked={formValues.is_open_when_owner_not_in}
                onChange={handleChange}
              />
              <label className="form-label form-check-label" htmlFor="is_open_when_owner_not_in">
                當您不在遊戲內也開放進入
              </label>
            </div>
            <button type="submit" className="btn btn-primary mt-5">開始玩</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGamePage;