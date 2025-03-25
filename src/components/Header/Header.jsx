import React from "react";
import './Header.css'
import Logo from '../../assets/layout_set_logo.8111534916ed75207ff4.png'
import MenuHmburg from "../MenuHmburg/MenuHmburg";

const Header = () => {
  return (
    <>
      <div className="bg-yellow-500 h-1 w-full"></div>
      <div className="header text-4xl font-bold bg-sky-700 h-30 flex justify-center items-center">
        <img className="logo" src={Logo} />
        <p className="text-white text-center p-8">Sistema de gestión de señales</p>
        <MenuHmburg />
      </div>
    </>
  );
};

export default Header;
