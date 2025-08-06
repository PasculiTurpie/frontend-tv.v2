import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";
import './LogoutButton.css'

const LogoutButton = () => {
  const { setUser, user, setIsAuth } = useContext(UserContext);
  const navigate = useNavigate();

  const {email} = user


  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/api/v2/logout", {email}, {
        withCredentials: true,
      });
      console.log('Cerrando')

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Sesión cerrada",
        showConfirmButton: false,
        timer: 1500,
      });
      setUser({});
      setIsAuth(false);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return <li className='nav__links  nav__links-text' onClick={handleLogout}>Cerrar sesión</li>;
};

export default LogoutButton;