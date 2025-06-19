import { Field, Form, Formik } from "formik";
import React from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";

const RtesVmxForm = () => {
  return (
    <>
         <div className="outlet-main">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/rtesVmx-listar">Listar</Link>
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

export default RtesVmxForm