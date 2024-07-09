import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import PlayerProfileHeader from '../components/PlayerProfileHeader';
import ToggleButtonBar from '../components/ToggleButtonBar';

const PlayerProfilePage = () => {
  const { playerId } = useParams();
  const location = useLocation();

  if (location.pathname === `/profile/${playerId}`) {
    return <Navigate to={`/profile/${playerId}/showcase`} />;
  }

  return (
    <div className="player-profile-page">
      <PlayerProfileHeader />
      <ToggleButtonBar />
      <hr />
      <Outlet />
    </div>
  );
};

export default PlayerProfilePage;
