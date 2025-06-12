import { Formik, Field, Form } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";

const ipMulticastRegex =
    /^(2(?:[0-4]\d|5[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5]))$/;

const ipGestionRegex = /172.19.14\.\d/;

const RegisterSchemaTitan = Yup.object().shape({
    nombreTitan: Yup.string(),
    urlTitan: Yup.string().matches(
        /(?:https?\:\/\/\w+\.\w+\.\w+.+)/,
        "Ingresa una url válida"
    ),
    mcastIn: Yup.string().matches(
        ipMulticastRegex,
        "Debe ser una multicast válida"
    ),
    mcastOut: Yup.string().matches(
        ipMulticastRegex,
        "Debe ser una multicast válida"
    ),
    ipGestion: Yup.string().matches(ipGestionRegex, "Debe ser una ip válida"),
});

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
        <Formik
        initialValues={
           {nombreTitan: "",
                    urlTitan: "",
                    mcastIn: "",
                    mcastOut: "",
                    ipGestion: "",
                    }
        }
        validationSchema={RegisterSchemaTitan}
         enableReinitialize={true}
                    onSubmit={async (values, { resetForm }) => {
                        try {
                            const response = await api.createTitan(values);
                            console.log(response);
                            Swal.fire({
                                title: "Titan guardado exitosamente",
                                icon: "success",
                                html: `
                                <p><strong>Nombre Titan:</strong> ${values.nombreTitan}</p>
                                <p><strong>Modelo:</strong> ${values.ipGestion}</p>
                              `,
                            });
                          resetForm();
                        } catch (error) {
                            console.log(error);
                            Swal.fire({
                                title: "Error",
                                icon: "error",
                                text: `Duplicidad de datos`,
                                footer: `${error.response.data.message}`,
                            });
                        }
                    }}
        
        >
        {({errors, touched })=>(

          <Form className="form__add">
             <div className="form__group">
                                            <label
                                                htmlFor="nombreTitan"
                                                className="form__group-label"
                                            >
                                                Nombre Titan
                                                <br />
                                                <Field
                                                    type="text"
                                                    className="form__group-input"
                                                    placeholder="Nombre titan"
                                                    name="nombreTitan"
                                                />
                                            </label>
            
                                            {errors.nombreTitan && touched.nombreTitan ? (
                                                <div className="form__group-error">
                                                    {errors.nombreTitan}
                                                </div>
                                            ) : null}
                                        </div>
            
                                        <div className="form__group">
                                            <label
                                                htmlFor="urlTitan"
                                                className="form__group-label"
                                            >
                                                Multicast In Titan
                                                <br />
                                                <Field
                                                    type="text"
                                                    className="form__group-input"
                                                    placeholder=" Multicast In"
                                                    name="mcastIn"
                                                />
                                            </label>
            
                                            {errors.mcastIn && touched.mcastIn ? (
                                                <div className="form__group-error">
                                                    {errors.mcastIn}
                                                </div>
                                            ) : null}
                                        </div>
            
                                        <div className="form__group">
                                            <label
                                                htmlFor="mcastOut"
                                                className="form__group-label"
                                            >
                                                Multicast Out Titan
                                                <br />
                                                <Field
                                                    type="text"
                                                    className="form__group-input"
                                                    placeholder="Multicast Out"
                                                    name="mcastOut"
                                                />
                                            </label>
            
                                            {errors.mcastOut && touched.mcastOut ? (
                                                <div className="form__group-error">
                                                    {errors.mcastOut}
                                                </div>
                                            ) : null}
                                        </div>
            
                                        <div className="form__group">
                                            <label
                                                htmlFor="ipGestion"
                                                className="form__group-label"
                                            >
                                                Ip Gestión Titan
                                                <br />
                                                <Field
                                                    type="text"
                                                    className="form__group-input"
                                                    placeholder="Ip gestión"
                                                    name="ipGestion"
                                                />
                                            </label>
            
                                            {errors.ipGestion && touched.ipGestion ? (
                                                <div className="form__group-error">
                                                    {errors.ipGestion}
                                                </div>
                                            ) : null}
                                        </div>
                                        <button
                                            type="submit"
                                            className={`button btn-primary`}
                                        >
                                            Enviar
                                        </button>
          </Form>

        )}
        </Formik>
      </div>
    </>
  )
}

export default FormEncoderTitan