import React from 'react'
import './Nav.css'
import { Link } from 'react-router-dom'

const Nav = () => {
  return (
    <div className="nav">
        <ul className='nav__menu-list'>
          <li className='nav__links'><Link to="">Inicio</Link></li>
          <li className='nav__links'><Link to="admin">Admin</Link></li>
        </ul>
    </div>
  )
}

export default Nav