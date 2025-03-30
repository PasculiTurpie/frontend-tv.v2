import React from 'react'
import Search from '../Search/Search'
import './Nav.css'
import { Link } from 'react-router-dom'

const Nav = () => {
  return (
    <div className='nav-container'>
      <div className='nav-line'></div>
      <nav className='nav'>
        <ul className='nav-items flex space-x-4 flex-grow justify-center'>
          <Link to='/'><li className="self-center">Inicio</li></Link>
          <Link to='admin'><li className="self-center">Admin</li></Link>
          <Link to='contacto'><li className="self-center">Contacto</li></Link>
        </ul>
        <Search />
      </nav>
    </div>


  )
}

export default Nav