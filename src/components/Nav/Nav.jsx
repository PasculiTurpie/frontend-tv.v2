import React from 'react'
import './Nav.css'
import { Link } from 'react-router-dom'

const Nav = ({user}) => {
  return (
    <div className="nav">
        <ul className='nav__menu-list'>
        <li className='nav__links'><Link className="nav__links-text" to="/">Inicio</Link></li>
        {
          user.role === 'admin' ? '' : <li className='nav__links'><Link className="nav__links-text" to="/login">Admin</Link></li>
        }
        
        {
          user.role === 'admin' && <li className='nav__links'><Link className="nav__links-text" to="/">Cerrar sesión</Link></li>
        }
        </ul>
    </div>
  )
}

export default Nav