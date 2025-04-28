import React from "react";
import { Link } from "react-router-dom";
import "../../components/Login/Login.css";


const RegisterUser = () => {
    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/listar-user">Listar</Link>
                        </li>
                        <li
                            className="breadcrumb-item active"
                            aria-current="page"
                        >
                            Registrar Usuario
                        </li>
                    </ol>
                </nav>
            </div>
        </>
    );
};

export default RegisterUser;
