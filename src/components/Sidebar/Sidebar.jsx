import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

const Sidebar = () => {

  const userLog = JSON.parse(localStorage.getItem('userRole:role'))

  const handleCloseSession = () => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Cerrando sesión",
      showConfirmButton: false,
      timer: 1500
    });
    localStorage.removeItem('useRole:role')
  }
  console.log(userLog)
  return (
    <div className="sidebar">
      <img src={userLog.profilePicture} alt="Profile" className="sidebar__profile-pic" />
      <p className='profile'>Bienvenido<br /> {userLog.username}</p>
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

export default Sidebar;
