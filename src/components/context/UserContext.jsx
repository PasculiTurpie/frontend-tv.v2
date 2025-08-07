import { createContext, useState, useEffect } from "react";
import api from "../../utils/api";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await api.profile();
      setUser(res);
      setIsAuth(true);
    } catch (error) {
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);
if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <UserContext.Provider value={{ user, setUser, isAuth, setIsAuth, loading }}>
      {children}
    </UserContext.Provider>
  );
};
