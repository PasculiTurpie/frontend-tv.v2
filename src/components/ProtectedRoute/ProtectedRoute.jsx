import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";

// Ruta protegida basada en cookies httpOnly:
// - Llama a /auth/me (o /auth/profile fallback en api.js) para verificar sesión.
// - Si 200 => deja pasar; si no => redirige a /auth/login.
export default function ProtectedRoute() {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    let mounted = true;
    api._axios
      .get("/auth/me")
      .then(() => mounted && setOk(true))
      .catch(() => mounted && setOk(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (ok === null) return <div style={{ padding: 16 }}>Cargando...</div>;
  return ok ? <Outlet /> : <Navigate to="/auth/login" replace />;
}
