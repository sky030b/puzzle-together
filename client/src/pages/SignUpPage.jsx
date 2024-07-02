import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getRandomHexCode, setCookie } from '../utils';

const SignUpPage = () => {
  const [nickname, setNickname] = useState('');
  const [representColor, setRepresentColor] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [isRoomPublic, setIsRoomPublic] = useState(false);
  const {
    playerInfo, setPlayerInfo, isAuthenticated, setIsAuthenticated
  } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    setRepresentColor(`#${getRandomHexCode()}`);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordCheck) {
      alert('兩次輸入的密碼不同，請再試一次。');
      return;
    }

    const signupInfo = {
      nickname: nickname.trim(),
      represent_color: representColor,
      email: email.trim(),
      password: password,
      is_room_public: isRoomPublic,
    };

    try {
      const res = await axios.post('/api/1.0/players/signup', signupInfo);
      const { accessToken, accessExpired, playerInfo } = res.data.data;
      setCookie('token', accessToken, accessExpired);
      setIsAuthenticated(true);
      setPlayerInfo(playerInfo);
      alert('註冊成功。');
      navigate(`/profile/${playerInfo.playerId}`);
    } catch (error) {
      console.error(error);
      alert(error.response.data);
    }
  };

  useEffect(() => {
    if (isAuthenticated) navigate(`/profile/${playerInfo.playerId}`);
  }, [playerInfo, isAuthenticated, navigate]);


  return (
    <div className="container-bg py-5 d-flex justify-content-center align-items-center">
      <div className="signup-section w-100">
        <h3 className="text-center mb-3">玩家註冊</h3>
        <form className="signup-form w-50 mx-auto" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nicknameInput" className="form-label">暱稱</label>
            <input
              type="text"
              className="form-control"
              id="nicknameInput"
              placeholder="請輸入您的暱稱"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="codeSelector" className="form-label">代表色</label>
            <input
              type="color"
              className="form-control form-control-color w-100"
              id="codeSelector"
              title="請選擇您的代表色"
              value={representColor}
              onChange={(e) => setRepresentColor(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="signupEmailInput" className="form-label">信箱</label>
            <input
              type="email"
              className="form-control"
              id="signupEmailInput"
              placeholder="請輸入您的信箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="signupPasswordInput" className="form-label">密碼</label>
            <input
              type="password"
              className="form-control"
              id="signupPasswordInput"
              placeholder="請輸入您的密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passwordCheckInput" className="form-label">密碼確認</label>
            <input
              type="password"
              className="form-control"
              id="passwordCheckInput"
              placeholder="請再次輸入您的密碼"
              value={passwordCheck}
              onChange={(e) => setPasswordCheck(e.target.value)}
              minLength="8"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="mb-3 d-flex">
            <input
              type="checkbox"
              className="form-check-input me-2"
              id="is_room_public"
              name="is_room_public"
              checked={isRoomPublic}
              onChange={(e) => setIsRoomPublic(e.target.checked)}
            />
            <label className="form-label form-check-label" htmlFor="is_room_public">
              是否開放其他玩家查看您的遊戲室
            </label>
          </div>
          <Link className="go-to-signin text-center d-block mb-3 text-secondary" to="/signin">
            已有帳號？前往登入 -&gt;
          </Link>

          <button type="submit" className="signup-btn btn btn-secondary w-100 mb-3">註冊</button>
          <button type="button" className="fb-signin-btn btn btn-primary w-100">使用 Google 登入</button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
