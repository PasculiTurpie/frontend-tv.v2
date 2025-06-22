import React, { useEffect, useState } from "react";
import { Formik, Field, Form } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import stylesSwitch from "./Switch.module.css";

const RegisterSchemaSwitch = Yup.object().shape({
    nameSwitch: Yup.string().required("Campo obligatorio"),
    interfacePort: Yup.string().required("Campo obligatorio"),
    vlanInterface: Yup.string().required("Campo obligatorio"),
});

const FormSwitch = ({
    itemId,
    modalOpen,
    setModalOpen,
    title,
    refreshList,
}) => {
    const [switchs, setSwitchs] = useState(null);

    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/switch-listar">Listar</Link>
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
                        nameSwitch: "",
                        urlConmutador: "",
                        interfacePort: "",
                        vlanInterface: "",
                    }}
            validationSchema={RegisterSchemaSwitch}
                    onSubmit={async (values, { resetForm }) => {
                        try {
                            const response = await api.createSwitch(values);
                            console.log(response);
                            Swal.fire({
                                title: "Switch guardado exitosamente",
                                icon: "success",
                                html: `
                                <p><strong>Nombre Switch:</strong> ${values.nameSwitch}</p>
                                <p><strong>Modelo:</strong> ${values.interfacePort}</p>
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
                            <h1 className="form__titulo">Registrar Switch</h1>
                            <div className={stylesSwitch.rows__group}>
                                <div className={stylesSwitch.columns__group}>
                                    <div className="form__group">
                                        <label
                                            htmlFor="nameSwitch"
                                            className="form__group-label"
                                        >
                                            Nombre Switch
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre switch"
                                                name="nameSwitch"
                                            />
                                        </label>

                                        {errors.nameSwitch &&
                                        touched.nameSwitch ? (
                                            <div className="form__group-error">
                                                {errors.nameSwitch}
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="form__group">
                                        <label
                                            htmlFor="interfacePort"
                                            className="form__group-label"
                                        >
                                            Interfaz
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Interfaz"
                                                name="interfacePort"
                                            />
                                        </label>

                                        {errors.interfacePort &&
                                        touched.interfacePort ? (
                                            <div className="form__group-error">
                                                {errors.interfacePort}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label
                                            htmlFor="vlanInterface"
                                            className="form__group-label"
                                        >
                                            Vlan
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Vlan"
                                                name="vlanInterface"
                                            />
                                        </label>

                                        {errors.vlanInterface &&
                                        touched.vlanInterface ? (
                                            <div className="form__group-error">
                                                {errors.vlanInterface}
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

export default FormSwitch;
