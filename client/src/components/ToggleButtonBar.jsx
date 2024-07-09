import { useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ToggleButtonBar = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { playerInfo } = useContext(AuthContext);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isOwner = playerInfo && playerInfo.playerId === playerId;

  return (
    <div className="btn-group mx-auto w-50 d-flex justify-content-center" role="group" aria-label="Basic radio toggle button group">
      <input
        type="radio"
        className="btn-check"
        name="btnradio"
        id="btnradio1"
        autoComplete="off"
        checked={location.pathname.includes(`/profile/${playerId}/news`)}
        onChange={() => handleNavigation(`/profile/${playerId}/news`)}
      />
      <label className="btn btn-outline-primary" htmlFor="btnradio1">動態牆</label>

      <input
        type="radio"
        className="btn-check"
        name="btnradio"
        id="btnradio2"
        autoComplete="off"
        checked={location.pathname.includes(`/profile/${playerId}/showcase`)}
        onChange={() => handleNavigation(`/profile/${playerId}/showcase`)}
      />
      <label className="btn btn-outline-warning" htmlFor="btnradio2">展示牆</label>

      {isOwner && (
        <>
          <input
            type="radio"
            className="btn-check"
            name="btnradio"
            id="btnradio3"
            autoComplete="off"
            checked={location.pathname.includes(`/profile/${playerId}/my-own-games`)}
            onChange={() => handleNavigation(`/profile/${playerId}/my-own-games`)}
          />
          <label className="btn btn-outline-success" htmlFor="btnradio3">我創的遊戲</label>
        </>
      )}

    </div>
  );
};

export default ToggleButtonBar;
