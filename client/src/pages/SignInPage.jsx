import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { setCookie } from '../utils';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const signinInfo = {
      email: email.trim(),
      password: password,
    };

    try {
      const res = await axios.post('/api/1.0/players/signin', signinInfo);
      const { accessToken, accessExpired } = res.data.data;
      setCookie('token', accessToken, accessExpired);
      setIsAuthenticated(true);
      alert('登入成功。');
      navigate(`/profile/${res.data.data.playerId}`);
    } catch (error) {
      console.error(error);
      alert(error.response.data);
    }
  };

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
              placeholder="請輸入您的信箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="signinPasswordInput" className="form-label">密碼</label>
            <input
              type="password"
              className="form-control"
              id="signinPasswordInput"
              placeholder="請輸入您的密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              autoComplete="new-password"
              required
            />
          </div>
          <Link className="go-to-signup text-center d-block mb-3 text-secondary" to="/signup">
            尚無帳號？前往註冊 -&gt;
          </Link>
          <button type="submit" className="signin-btn btn btn-secondary w-100 mb-3">登入</button>
          <button type="button" className="fb-signin-btn btn btn-primary w-100">使用 Google 登入</button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;