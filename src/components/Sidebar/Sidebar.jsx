import React, { useContext } from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';



const Sidebar = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="sidebar">
      {user?.profilePicture && (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="sidebar__profile-pic"
        />
      )}
      <p className="profile">
        Bienvenido<br />
        <strong>{user?.username || "Usuario"}</strong>
      </p>

      <hr className="sidebar__line" />

      <ul className="sidebar__list">
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/satelite">Satélite</Link>
        </li>
        <li>
          <Link to="/ird">Encoder Ird</Link>
        </li>
        <hr />
        <li>
          <Link to="/registrar-user">Usuarios</Link>
        </li>
      </ul>
      
   
    </div>
  );
};

export default Sidebar;

