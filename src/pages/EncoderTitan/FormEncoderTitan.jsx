import { Formik, Field, Form } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";

const FormEncoderTitan = () => {
  return (
    <>
      <div className="outlet-main">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/listar-titan">Listar</Link>
            </li>
            <li
              className="breadcrumb-item active"
              aria-current="page"
            >
              Formulario
            </li>
          </ol>
        </nav>
        <h1>Formulario Titan</h1>
      </div>
    </>
  )
}

export default FormEncoderTitan