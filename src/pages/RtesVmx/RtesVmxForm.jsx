import { Field, Form, Formik } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import { ipMulticastRegex } from "../../utils/regexValidate";

const RegisterRtesVmx = Yup.object().shape({
    nombreRtesVmx: Yup.string().required("El campo es obligatorio"),
    mcastIn: Yup.string()
        .required("El campo es obligatorio")
        .matches(ipMulticastRegex, "Debe ser una multicast válida"),
    mcastOut: Yup.string()
        .required("El campo es obligatorio")
        .matches(ipMulticastRegex, "Debe ser una multicast válida"),
});

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
                <Formik
                    initialValues={{
                        nombreRtesVmx: "",
                        mcastIn: "",
                        mcastOut: "",
                    }}
                    validationSchema={RegisterRtesVmx}
                    enableReinitialize={true}
                    onSubmit={async (values, { resetForm }) => {
                        try {
                            const response = await api.createRtesVmx(values);
                            console.log(response);
                            Swal.fire({
                                title: "Rtes Vmx guardado exitosamente",
                                icon: "success",
                                html: `
                                <p><strong>Nombre Rtes Vmx:</strong> ${values.nombreRtesVmx}</p>
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
                    {({ errors, touched }) => (
                        <Form className="form__add">
                            <h1 className="form__titulo">Registrar RTES VMX</h1>
                            <div className="form__group">
                                <label
                                    htmlFor="nombreRtesVmx"
                                    className="form__group-label"
                                >
                                    Nombre RtesVmx
                                    <br />
                                    <Field
                                        type="text"
                                        className="form__group-input"
                                        placeholder="Nombre Rtes Vmx"
                                        name="nombreRtesVmx"
                                    />
                                </label>

                                {errors.nombreRtesVmx &&
                                touched.nombreRtesVmx ? (
                                    <div className="form__group-error">
                                        {errors.nombreRtesVmx}
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
                                        placeholder="Multicast In"
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
                                    Multicast Out
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

export default RtesVmxForm;
