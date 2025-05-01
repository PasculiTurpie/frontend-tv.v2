import React from 'react'
import './Nav.css'
import { Link } from 'react-router-dom'

const Nav = () => {

  const userRole = (localStorage.getItem('isLogin'))
  console.log(userRole)

  const handleCloseSession = () =>{
    localStorage.removeItem('isLogin')

  }


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

export default Nav