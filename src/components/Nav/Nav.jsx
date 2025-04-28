import React, { useContext } from 'react'
import './Nav.css'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'


console.log(UserContext)
const Nav = () => {


  const {user} = useContext(UserContext)
  
  console.log(user.role)
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