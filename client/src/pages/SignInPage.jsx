import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import { getCookie, setCookie } from '../utils';

const SignInPage = () => {
  const [email, setEmail] = useState('gade@gmail.com');
  const [password, setPassword] = useState('gadeisgood');
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
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/1.0/players/signin`, signinInfo, {
        headers: {
          'Authorization': `Bearer ${getCookie('token')}`
        }
      });
      const { accessToken, accessExpired, playerInfo } = res.data.data;
      setCookie('token', accessToken, accessExpired);
      setIsAuthenticated(true);
      setPlayerInfo(playerInfo);
      toast.success('登入成功。', { autoClose: 1500 });
      navigate(`/profile/${playerInfo.playerId}`);
    } catch (error) {
      console.error(error);
      if (error.response.data.errors)  toast.error(error.response.data.errors.map((error) => error.msg).join('\n'), { autoClose: 2000 });
      else toast.error(error.response.data, { autoClose: 2000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.title = '帕索兔蓋德 - 玩家登入';

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
          {/* <button type="button" className="fb-signin-btn btn btn-primary w-100" disabled={isSubmitting}>使用 Google 登入</button> */}
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
