import { createContext, useState, useEffect } from "react";
import api from "../../utils/api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true); 

  console.log(user)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.getUserId(user.id)
          .then((res) => {
          console.log(res.data.user )
          setUser(res.data.user);
          setIsAuth(true);
        })
      } catch (error) {
        setUser(null);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isAuth, setIsAuth, loading }}>
      {children}
    </UserContext.Provider>
  );
};
