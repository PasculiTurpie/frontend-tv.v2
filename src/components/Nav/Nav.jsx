import React from 'react'
import Search from '../Search/Search'

const Nav = () => {
  return (
    <nav className='bg-sky-800 text-white h-10 flex justify-center px-100'>
      <ul className='flex space-x-4 flex-grow justify-center'>
        <li className="self-center">Inicio</li>
        <li  className="self-center">Admin</li>
        <li  className="self-center">Contacto</li>
      </ul>
      <div className='ml-auto self-center'>
      <Search />
      </div>
    </nav>


  )
}

export default Nav