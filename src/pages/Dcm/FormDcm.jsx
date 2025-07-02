import { Field, Form, Formik } from "formik";
import React from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import stylesDcm from "./Dcm.module.css";
import { ipGestionRegex } from "../../utils/regexValidate";

const AddSchemaDcm = Yup.object().shape({
    nombreDcm: Yup.string().required("Campo obligatorio"),
    ipGestion: Yup.string()
        .matches(ipGestionRegex, "Debe ser una ip válida")
        .required("Campo obligatorio"),
    port: Yup.string().required("Campo obligatorio"),
});

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

                <Formik
                    initialValues={{
                        nombreDcm: "",
                        ipGestion: "",
                        port: "",
                    }}
                    validationSchema={AddSchemaDcm}
                    enableReinitialize={true}
                    onSubmit={async (values, { resetForm }) => {
                        try {
                            const response = await api.createDcm(values);
                            console.log(response);
                            Swal.fire({
                                title: "Dcm guardado exitosamente",
                                icon: "success",
                                html: `
                                <p><strong>Nombre Dcm:</strong> ${values.nombreDcm}</p>
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
                    {({ errors, touched }) => (
                        <Form className="form__add">
                            <h1 className="form__titulo">Ingresa un DCM</h1>
                            <div className={stylesDcm.rows__group}>
                                <div className={stylesDcm.columns__group}>
                                    <div className="form__group">
                                        <label
                                            htmlFor="nombreDcm"
                                            className="form__group-label"
                                        >
                                            Nombre Dcm
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre dcm"
                                                name="nombreDcm"
                                            />
                                        </label>

                                        {errors.nombreDcm &&
                                        touched.nombreDcm ? (
                                            <div className="form__group-error">
                                                {errors.nombreDcm}
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
                                    <div className="form__group">
                                        <label
                                            htmlFor="port"
                                            className="form__group-label"
                                        >
                                            Puerto
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre dcm"
                                                name="port"
                                            />
                                        </label>

                                        {errors.port && touched.port ? (
                                            <div className="form__group-error">
                                                {errors.port}
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

export default FormDcm;
