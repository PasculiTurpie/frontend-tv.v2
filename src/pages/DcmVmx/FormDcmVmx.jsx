import { Formik, Field, Form } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import { ipMulticastRegex, ipGestionRegex } from "../../utils/regexValidate";

const FormDcmVmx = () => {
  return (
    <>
<div className="outlet-main">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/listar-dcmVmx">Listar</Link>
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

export default FormDcmVmx