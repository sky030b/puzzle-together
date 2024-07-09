import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import SignUpPage from '../pages/SignUpPage';
import SignInPage from '../pages/SignInPage';
import PlayerProfilePage from '../pages/PlayerProfilePage';
// import News from '../components/News';
import Showcase from '../components/Showcase';
import MyOwnGames from '../components/MyOwnGames';
import CreateGamePage from '../pages/CreateGamePage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="create-game" element={<CreateGamePage />} />
        <Route path="profile/:playerId" element={<PlayerProfilePage />}>
          {/* <Route path="news" element={<News />} /> */}
          <Route path="showcase" element={<Showcase />} />
          <Route path="my-own-games" element={<MyOwnGames />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
