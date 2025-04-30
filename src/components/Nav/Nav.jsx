import React, { useContext } from "react";
import "./Nav.css";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Nav = () => {
    const navigate = useNavigate();

    const { user, setUser } = useContext(UserContext);

    const handleCloseSession = () => {
        setUser("");
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Cerrando sesión",
            showConfirmButton: false,
            timer: 1500,
        });
        navigate("/");
    };

    return (
        <div className="nav">
            <ul className="nav__menu-list">
                <li className="nav__links">
                    <Link className="nav__links-text" to="/">
                        Inicio
                    </Link>
                </li>
                {user.role === "admin" ? (
                    ""
                ) : (
                    <li className="nav__links">
                        <Link className="nav__links-text" to="/login">
                            Admin
                        </Link>
                    </li>
                )}

                {user.role === "admin" && (
                    <li className="nav__links">
                        <Link
                            className="nav__links-text"
                            to="/"
                            onClick={handleCloseSession}
                        >
                            Cerrar sesión
                        </Link>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Nav;
