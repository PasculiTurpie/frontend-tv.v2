import React from 'react'
import { useContext } from "react";
import { UserContext } from '../context/UserContext'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

const Sidebar = () => {

  const { user, setUser, isAuth, setIsAuth } = useContext(UserContext);

  console.log(user)
  const handleCloseSession = () => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Cerrando sesión",
      showConfirmButton: false,
      timer: 1500
    });
    localStorage.remove('isLogin')
  }
  
  return (
    <div className="sidebar">
      <img src={user.profilePicture} alt="Profile" className="sidebar__profile-pic" />
      <p className='profile'>Bienvenido<br /> {user.username}</p>
      <p className='session' onClick={handleCloseSession}>Cerrar sessión</p>
      <hr className='sidebar__line'/>
      <ul className='sidebar__list'>
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/satelite">Satelite</Link>
        </li>
        <li>
          <Link to="/ird">Ird</Link>
        </li>
        <hr />
        <li>
          <Link to="/registrar-user">Usuarios</Link>
        </li>
        </ul>
    </div>
  )
}

export default Sidebar