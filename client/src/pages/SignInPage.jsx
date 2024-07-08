import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { setCookie } from '../utils';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    playerInfo, setPlayerInfo, isAuthenticated, setIsAuthenticated
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    try {
      e.preventDefault();

      if (isSubmitting) return;

      const signinInfo = {
        email: email.trim(),
        password: password,
      };

      setIsSubmitting(true);
      const res = await axios.post('/api/1.0/players/signin', signinInfo);
      const { accessToken, accessExpired, playerInfo } = res.data.data;
      setCookie('token', accessToken, accessExpired);
      setIsAuthenticated(true);
      setPlayerInfo(playerInfo);
      alert('登入成功。');
      navigate(`/profile/${playerInfo.playerId}`);
    } catch (error) {
      console.error(error);
      alert(error.response.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) navigate(`/profile/${playerInfo.playerId}`);
  }, [playerInfo, isAuthenticated, navigate]);

  return (
    <div className="container-bg py-5 d-flex justify-content-center align-items-center">
      <div className="signin-section w-100">
        <h3 className="text-center mb-3">玩家登入</h3>
        <form className="signin-form w-50 mx-auto" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="signinEmailInput" className="form-label">信箱</label>
            <input
              type="email"
              className="form-control"
              id="signinEmailInput"
              name="email"
              placeholder="請輸入您的信箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="signinPasswordInput" className="form-label">密碼</label>
            <input
              type="password"
              className="form-control"
              id="signinPasswordInput"
              name="password"
              placeholder="請輸入您的密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              autoComplete="current-password"
              required
            />
          </div>
          <Link className="go-to-signup text-center d-block mb-3 text-secondary" to="/signup">
            尚無帳號？前往註冊 -&gt;
          </Link>
          <button type="submit" className="signin-btn btn btn-secondary w-100 mb-3" disabled={isSubmitting}>
            {isSubmitting ? '正在登入...' : '登入'}
          </button>
          <button type="button" className="fb-signin-btn btn btn-primary w-100" disabled={isSubmitting}>使用 Google 登入</button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
