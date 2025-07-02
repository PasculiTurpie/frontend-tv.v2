import React from 'react'
import { Form, Formik } from 'formik'
import { Link } from 'react-router-dom'

const ChannelList = () => {
  return (
    <>
            <div className="outlet-main">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <Link to="/channel">Formulario</Link>
                                    </li>
                                    <li
                                        className="breadcrumb-item active"
                                        aria-current="page"
                                    >
                                        Listar
                                    </li>
                                </ol>
            </nav>
            <Formik>
              <Form>
    
              </Form>
            </Formik>
            </div>
        </>
  )
}

export default ChannelList