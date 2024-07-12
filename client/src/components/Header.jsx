import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { removeCookie } from '../utils';
import { toast } from 'react-toastify';

const Header = () => {
  const { playerInfo, setPlayerInfo, isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [justSignedOut, setJustSignedOut] = useState(false);

  const handleSignOut = () => {
    removeCookie('token');
    setIsAuthenticated(false);
    setPlayerInfo({});
    toast.success('登出成功。', { autoClose: 1500 });
    setJustSignedOut(true);
  };

  useEffect(() => {
    if (justSignedOut) {
      navigate('/signin');
      setJustSignedOut(false);
    }
  }, [justSignedOut, navigate]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container-fluid justify-content-between">
        <NavLink className="navbar-brand" to="/">
          <img src="https://dsz5eydy8se7.cloudfront.net/puzzle-together.svg" alt="logo" width="30" height="24" className="d-inline-block align-text-top" />
          帕索兔蓋德
        </NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link cursor-pointer" aria-current="page" to="/create-game">創建遊戲</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link cursor-pointer" aria-current="page" to={`/profile/${playerInfo.playerId}`}>玩家檔案</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link signout-btn cursor-pointer" onClick={handleSignOut}>登出</NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link cursor-pointer" aria-current="page" to="/signup">註冊</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link cursor-pointer" aria-current="page" to="/signin">登入</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
