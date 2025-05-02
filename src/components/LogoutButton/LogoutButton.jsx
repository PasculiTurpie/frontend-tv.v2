import axios from "axios";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";


const LogoutButton = () => {
  const { setUser, isAuth, setIsAuth } = useContext(UserContext);
  const navigate = useNavigate();

  console.log("Render LogoutButton")

  console.log(isAuth)

  const handleLogout = async () => {
    await axios.post("http://localhost:3000/api/v2/logout", {}, {
      withCredentials: true,
    });

        setUser({});
        setIsAuth(false);
        navigate("/login");
    console.log(`BORRANDO TOKEN`)
    console.log(isAuth)
  };

  return <li className='nav__links' onClick={ handleLogout }>Cerrar sesión</li>;
};

export default LogoutButton;
