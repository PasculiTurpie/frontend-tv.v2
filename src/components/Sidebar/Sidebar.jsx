import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'

const Sidebar = ({ user }) => {
  
  return (
    <div className="sidebar">
      <img src={user.profilePicture} alt="Profile" className="sidebar__profile-pic" />
      <p className='profile'>Bienvenido<br /> {user.name}</p>
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
        </ul>
    </div>
  )
}

export default Sidebar