import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playerInfo, setPlayerInfo] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/1.0/players/playerInfo`);
        setIsAuthenticated(true);
        setPlayerInfo(res.data);
      } catch (error) {
        setIsAuthenticated(false);
        setPlayerInfo({});
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ playerInfo, setPlayerInfo, isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
