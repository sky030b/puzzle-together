import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getRandomHexCode, setCookie } from '../utils';
import { toast } from 'react-toastify';

const SignUpPage = () => {
  const [nickname, setNickname] = useState('');
  const [representColor, setRepresentColor] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    playerInfo, setPlayerInfo, isAuthenticated, setIsAuthenticated
  } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    setRepresentColor(`#${getRandomHexCode()}`);
  }, []);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isSubmitting) return;

      if (password !== passwordCheck) {
        toast.error('兩次輸入的密碼不同，請再試一次。', { autoClose: 2000 });
        return;
      }

      if (nickname.trim().startsWith('匿名')) return toast.error('禁止以「匿名」為開頭設定暱稱。', { autoClose: 2000 });

      const signupInfo = {
        nickname: nickname.trim(),
        represent_color: representColor,
        email: email.trim(),
        password: password
      };

      setIsSubmitting(true);
      const res = await axios.post('/api/1.0/players/signup', signupInfo);
      const { accessToken, accessExpired, playerInfo } = res.data.data;
      setCookie('token', accessToken, accessExpired);
      setIsAuthenticated(true);
      setPlayerInfo(playerInfo);
      toast.success('註冊成功。', { autoClose: 1500 });
      navigate(`/profile/${playerInfo.playerId}`);
    } catch (error) {
      console.error(error);
      toast.error(error.response.data, { autoClose: 2000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.title = '帕索兔蓋德 - 玩家註冊';

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
              name="email"
              placeholder="請輸入您的信箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="signupPasswordInput" className="form-label">密碼</label>
            <input
              type="password"
              className="form-control"
              id="signupPasswordInput"
              name="password" 
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
              name="passwordCheck"
              placeholder="請再次輸入您的密碼"
              value={passwordCheck}
              onChange={(e) => setPasswordCheck(e.target.value)}
              minLength="8"
              autoComplete="new-password"
              required
            />
          </div>

          <Link className="go-to-signin text-center d-block mb-3 text-secondary" to="/signin">
            已有帳號？前往登入 -&gt;
          </Link>

          <button type="submit" className="signup-btn btn btn-secondary w-100 mb-3" disabled={isSubmitting}>
            {isSubmitting ? '正在註冊...' : '註冊'}
          </button>
          {/* <button type="button" className="fb-signin-btn btn btn-primary w-100" disabled={isSubmitting}>使用 Google 登入</button> */}
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
