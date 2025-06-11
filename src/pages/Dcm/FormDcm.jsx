import React from 'react'
import { Link } from 'react-router-dom'

const FormDcm = () => {
  return (
    <>
      <div className="outlet-main">
                          <nav aria-label="breadcrumb">
                              <ol className="breadcrumb">
                                  <li className="breadcrumb-item">
                                      <Link to="/dcm-listar">Listar</Link>
                                  </li>
                                  <li
                                      className="breadcrumb-item active"
                                      aria-current="page"
                                  >
                                      Formulario
                                  </li>
                              </ol>
                          </nav>
                          
              <h1>Formulario DCM</h1>
              </div>
    </>
  )
}

export default FormDcm