import React from 'react'
import { Link } from 'react-router-dom'

const Ird = () => {
  return (
    <>
                <div className="outlet-main">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/listar-ird">Listar</Link>
                            </li>
                            <li
                                className="breadcrumb-item active"
                                aria-current="page"
                            >
                                Formulario
                            </li>
                        </ol>
                    </nav>
                    </div>
                    </>
  )
}

export default Ird