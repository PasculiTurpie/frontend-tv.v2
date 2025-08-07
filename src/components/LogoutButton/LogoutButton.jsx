import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";
import './LogoutButton.css'
import api from "../../utils/api";

const LogoutButton = () => {
  const { setUser, user, setIsAuth } = useContext(UserContext);
  const navigate = useNavigate();

  // Validar que user exista antes de destructurar email
  const email = user?.email;

  const handleLogout = async () => {
    try {
      await api.logout()
      console.log('Cerrando')

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Sesión cerrada",
        showConfirmButton: false,
        timer: 1500,
      });
      setUser(null);       // mejor null en vez de {}
      setIsAuth(false);
      navigate("/");
    } catch (error) {
      Swal.fire({
        icon:"error",
        title:"Error al cerrar sesión",
        showConfirmButton: false,
        timer: 1500,
      })
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <li className='nav__links nav__links-text' onClick={handleLogout}>
      Cerrar sesión
    </li>
  );
};

export default LogoutButton;
