import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import SignUpPage from '../pages/SignUpPage';
import SignInPage from '../pages/SignInPage';
// import PlayerProfilePage from '../pages/PlayerProfilePage';
// import News from '../pages/News';
// import Showcase from '../pages/Showcase';
// import Playground from '../pages/Playground';
import CreateGamePage from '../pages/CreateGamePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="create-game" element={<CreateGamePage />} />
        {/* <Route path="profile/:playerId" element={<PlayerProfilePage />}>
          <Route path="news" element={<News />} />
          <Route path="showcase" element={<Showcase />} />
          <Route path="playground" element={<Playground />} />
        </Route> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
