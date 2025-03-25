import React from 'react'
import Search from '../Search/Search'
import './Nav.css'

const Nav = () => {
  return (
    <div className='nav-container'>
      <div className='nav-line'></div>
      <nav className='nav'>
        <ul className='nav-items flex space-x-4 flex-grow justify-center'>
          <li className="self-center">Inicio</li>
          <li className="self-center">Admin</li>
          <li className="self-center">Contacto</li>
        </ul>
        <Search />
      </nav>
    </div>


  )
}

export default Nav