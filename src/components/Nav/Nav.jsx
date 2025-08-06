import React, { useContext } from "react";
import "./Nav.css";
import { Link, NavLink } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import LogoutButton from "../LogoutButton/LogoutButton";

const Nav = () => {
    const { isAuth } = useContext(UserContext);

    return (
        <div className="nav">
            <ul className="nav__menu-list">
                <li className="nav__links">
                    <Link className="nav__links-text" to="/">
                        Inicio
                    </Link>
                </li>
                {isAuth ? (
                    <LogoutButton />
                ) : (
                    <li className="nav__links">
                        <Link className="nav__links-text" to="/login">
                            Admin
                        </Link>
                    </li>
                )}
                
            </ul>
        </div>
    );
};
export default Nav;
