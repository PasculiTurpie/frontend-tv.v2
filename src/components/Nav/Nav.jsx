import React from 'react'
import './Nav.css'
import { Link } from 'react-router-dom'

const Nav = () => {
    const navigate = useNavigate();

  const userRole = (localStorage.getItem('isLogin'))
  console.log(userRole)

  const handleCloseSession = () =>{
    localStorage.removeItem('isLogin')

  }

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

<<<<<<< HEAD
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
=======
  return (
    <div className="nav">
        <ul className='nav__menu-list'>
        <li className='nav__links'><Link className="nav__links-text" to="/">Inicio</Link></li>
        {
          userRole === 'true' ? <li className='nav__links'><Link className="nav__links-text" to="/" onClick={handleCloseSession}>Cerrar sesión</Link></li> : <li className='nav__links'><Link className="nav__links-text" to="/login">Admin</Link></li>
        }
        </ul>
    </div>
  )
}
>>>>>>> dce53305ecc018def28389d0e725ca52431ce63f

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
