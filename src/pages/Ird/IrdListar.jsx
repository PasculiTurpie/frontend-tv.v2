import React from 'react'
import { Link } from 'react-router-dom'

const IrdListar = () => {
  return (
    <>
    <div className="outlet-main">
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item">
                    <Link to="/ird">Formulario</Link>
                </li>
                <li
                    className="breadcrumb-item active"
                    aria-current="page"
                >
                    Listar
                </li>
            </ol>
        </nav>
        </div>
        </>
  )
}

export default IrdListar