import { Formik, Field, Form } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import { ipMulticastRegex, ipGestionRegex } from "../../utils/regexValidate";
import stylesDcmVmx from "./DcmVmx.module.css";

const UpdateSchemaDcmVmx = Yup.object().shape({
    nombreDcmVmx: Yup.string().required("Campo obligatorio"),
    urlDcmVmx: Yup.string().required("Campo obligatorio"),
    mcastIn: Yup.string()
        .required("Campo obligatorio")
        .matches(ipMulticastRegex, "Debe ser una multicast válida"),
    mcastOut: Yup.string()
        .required("Campo obligatorio")
        .matches(ipMulticastRegex, "Debe ser una multicast válida"),
    ipGestion: Yup.string()
        .required("Campo obligatorio")
        .matches(ipGestionRegex, "Debe ser una ip válida"),
});

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
                <Formik
                    initialValues={{
                        nombreDcmVmx: "",
                        mcastIn: "",
                        mcastOut: "",
                        ipGestion: "",
                        urlDcmVmx: "",
                    }}
                    validationSchema={UpdateSchemaDcmVmx}
                    onSubmit={async (values, { resetForm }) => {
                        try {
                            const response = await api.createDcmVmx(values);
                             
                            Swal.fire({
                                title: "DCM VMX guardado exitosamente",
                                icon: "success",
                                html: `
                                <p><strong>Nombre Titan:</strong> ${values.nombreDcmVmx}</p>
                                <p><strong>Modelo:</strong> ${values.ipGestion}</p>
                              `,
                            });
                            resetForm();
                        } catch (error) {
                             
                            Swal.fire({
                                title: "Error",
                                icon: "error",
                                text: `Duplicidad de datos`,
                                footer: `${error.response.data.message}`,
                            });
                        }
                    }}
                >
                    {({ errors, touched }) => (
                        <Form className="form__add">
                            <h1 className="form__titulo">Registrar Dcm Vmx</h1>
                            <div className={stylesDcmVmx.rows__group}>
                                <div className={stylesDcmVmx.columns__group}>
                                    <div className="form__group">
                                        <label
                                            htmlFor="nombreDcmVmx"
                                            className="form__group-label"
                                        >
                                            Nombre Dcmb Vmx
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre dcm vmx"
                                                name="nombreDcmVmx"
                                            />
                                        </label>

                                        {errors.nombreDcmVmx &&
                                        touched.nombreDcmVmx ? (
                                            <div className="form__group-error">
                                                {errors.nombreDcmVmx}
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="form__group">
                                        <label
                                            htmlFor="urlDcm"
                                            className="form__group-label"
                                        >
                                            Url Dcm vmx
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Url dcm"
                                                name="urlDcmVmx"
                                            />
                                        </label>

                                        {errors.urlDcmVmx &&
                                        touched.urlDcmVmx ? (
                                            <div className="form__group-error">
                                                {errors.urlDcmVmx}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label
                                            htmlFor="mcastIn"
                                            className="form__group-label"
                                        >
                                            Multicast In
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Multicast in"
                                                name="mcastIn"
                                            />
                                        </label>

                                        {errors.mcastIn && touched.mcastIn ? (
                                            <div className="form__group-error">
                                                {errors.mcastIn}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className={stylesDcmVmx.columns__group}>
                                    <div className="form__group">
                                        <label
                                            htmlFor="mcastOut"
                                            className="form__group-label"
                                        >
                                            Multicast Out
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre dcm"
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
                                            Ip gestión
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Ip gestión"
                                                name="ipGestion"
                                            />
                                        </label>

                                        {errors.ipGestion &&
                                        touched.ipGestion ? (
                                            <div className="form__group-error">
                                                {errors.ipGestion}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

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
    );
};

export default FormDcmVmx;
