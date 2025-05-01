import React from 'react'
import './Nav.css'
import { Link, useNavigate } from 'react-router-dom'

const Nav = () => {
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole:state')

  console.log(userRole)


  const handleCloseSession = () => {
    setUser("");
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Cerrando sesión",
      showConfirmButton: false,
      timer: 1500,
    });
    
    localStorage.removeItem('userRole:state')
    navigate("/");
  };

  return (
    <div className="nav">
      <ul className='nav__menu-list'>
        <li className='nav__links'><Link className="nav__links-text" to="/">Inicio</Link></li>
        {
          userRole === 'true' ? <li className='nav__links'><Link className="nav__links-text" to="/" onClick={handleCloseSession}>Cerrar sesión</Link></li> : <li className='nav__links'><Link className="nav__links-text" to="/login">Admin</Link></li>
        }
      </ul>
    </div>
  )
}
export default Nav;
