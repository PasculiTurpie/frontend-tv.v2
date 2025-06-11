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
        <li>
          <Link to="/dcm">Dcm</Link>
        </li>
        <li>
          <Link to="/titan">Encoder Titan</Link>
        </li>
        <li>
          <Link to="/dcmVmx">Dcm Vmx</Link>
        </li>
        <li>
          <Link to="/rtesVmx">Rtes Vmx</Link>
        </li>
        <li>
          <Link to="/str">STR</Link>
        </li>
        <li>
          <Link to="/router">Router</Link>
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

