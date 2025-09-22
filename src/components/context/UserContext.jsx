import { createContext, useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chequeo centralizado de sesión (lee cookie httpOnly desde el backend)
  const refreshAuth = useCallback(async () => {
    try {
      const res = await api.profile(); // intenta /auth/me, fallback /auth/profile
      setUser(res || null);
      setIsAuth(true);
    } catch {
      setUser(null);
      setIsAuth(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshAuth();
      if (mounted) setLoading(false);
    })();

    // Revalidar al volver a la pestaña (útil si expira o se renueva en segundo plano)
    const onVisibility = async () => {
      if (document.visibilityState === "visible") {
        await refreshAuth();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshAuth]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        refreshAuth, // expuesto para que Nav u otros revaliden si lo necesitan
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
