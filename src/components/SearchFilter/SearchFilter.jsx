import React from 'react'
import { Link } from 'react-router-dom'

const SearchFilter = () => {
  return (
    <>
       <div className="outlet-main">
                      <nav aria-label="breadcrumb">
                          <ol className="breadcrumb">
                              <li className="breadcrumb-item">
                                  <Link to="/channel-list">Listar</Link>
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

export default SearchFilter