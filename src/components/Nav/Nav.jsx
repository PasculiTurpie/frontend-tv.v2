import React, { useContext } from "react";
import "./Nav.css";
import { NavLink } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import LogoutButton from "../LogoutButton/LogoutButton";

const Nav = () => {
    const { isAuth } = useContext(UserContext);

    return (
        <div className="nav">
            <ul className="nav__menu-list">
                <li className="nav__links">
                    <NavLink activeClassName="active" className="nav__links-text" to="/">
                        Inicio
                    </NavLink>
                </li>
                {isAuth ? (
                    <LogoutButton />
                ) : (
                    <li className="nav__links">
                <NavLink activeClassName="active" className="nav__links-text" to="/login">
                            Admin
                        </NavLink>
                    </li>
                )}
                <li className="nav__links">
            <NavLink activeClassName="active" className="nav__links-text" to="/signal">
                        Señal
                    </NavLink>{" "}
                </li>
            </ul>
        </div>
    );
};
export default Nav;
