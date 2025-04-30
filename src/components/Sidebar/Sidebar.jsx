import React, { useContext } from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const Sidebar = () => {
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
        <div className="sidebar">
            <img
                src={user.profilePicture}
                alt="Profile"
                className="sidebar__profile-pic"
            />
            <p className="profile">
                Bienvenido
                <br /> {user.username}
            </p>
            <p className="session" onClick={handleCloseSession}>
                Cerrar sessión
            </p>
            <hr className="sidebar__line" />
            <ul className="sidebar__list">
                <li>
                    <Link to="/">Inicio</Link>
                </li>
                <li>
                    <Link to="/satelite">Satelite</Link>
                </li>
                <li>
                    <Link to="/ird">Ird</Link>
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
