import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import PlayerProfileHeader from '../components/PlayerProfileHeader';
import ToggleButtonBar from '../components/ToggleButtonBar';
import { useEffect } from 'react';

const PlayerProfilePage = () => {
  const { playerId } = useParams();
  const location = useLocation();

  useEffect(() => {
    document.title = '帕索兔蓋德 - 玩家檔案';
  }, []);

  if (location.pathname === `/profile/${playerId}`) {
    return <Navigate to={`/profile/${playerId}/showcase`} />;
  }

  return (
    <div className="player-profile-page">
      <PlayerProfileHeader />
      <hr />
      <ToggleButtonBar />
      <Outlet />
    </div>
  );
};

export default PlayerProfilePage;
