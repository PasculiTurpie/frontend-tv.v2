import { Field, Form, Formik } from "formik";
import React from "react";
import { Link } from "react-router-dom";
import { ipGestionRegex } from "../../utils/regexValidate";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import stylesEquipment from "./Equipment.module.css";

const SchemaEquipos = Yup.object().shape({
    nombre: Yup.string().required("Campo obligatorio"),
    marca: Yup.string().required("Campo obligatorio"),
    modelo: Yup.string().required("Campo obligatorio"),
    tipoEquipo: Yup.string().required("Campo obligatorio"),
    ip_gestion: Yup.string()
        .required("Campo obligatorio")
        .matches(ipGestionRegex, "Debe ser una ip válida"),
});

const Equipment = () => {
    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/equipment-list">Listar</Link>
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
                        nombre: "",
                        marca: "",
                        modelo: "",
                        tipoEquipo: "",
                        ip_gestion: "",
                    }}
                    validationSchema={SchemaEquipos}
                    onSubmit={async (values, { resetForm }) => {
                        try {
                            const response = await api.createEquipo(values);
                            console.log(response);
                            Swal.fire({
                                title: "Equipo guardado exitosamente",
                                icon: "success",
                                html: `
                    <p><strong>Nombre Equipo:</strong> ${values.nombre}</p>
                    <p><strong>Modelo:</strong> ${values.ip_gestion}</p>
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
                            <h1 className="form__titulo">Registrar Equipo</h1>
                            <div className={stylesEquipment.rows__group}>
                                <div className={stylesEquipment.columns__group}>
                                    <div className="form__group">
                                        <label
                                            htmlFor="nombre"
                                            className="form__group-label"
                                        >
                                            Nombre Equipo
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre equipo"
                                                name="nombre"
                                            />
                                        </label>

                                        {errors.nombre && touched.nombre ? (
                                            <div className="form__group-error">
                                                {errors.nombre}
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="form__group">
                                        <label
                                            htmlFor="marca"
                                            className="form__group-label"
                                        >
                                            Marca
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Marca"
                                                name="marca"
                                            />
                                        </label>

                                        {errors.marca && touched.marca ? (
                                            <div className="form__group-error">
                                                {errors.marca}
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="form__group">
                                        <label
                                            htmlFor="modelo"
                                            className="form__group-label"
                                        >
                                            Modelo
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Modelo"
                                                name="modelo"
                                            />
                                        </label>

                                        {errors.modelo && touched.modelo ? (
                                            <div className="form__group-error">
                                                {errors.modelo}
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="form__group">
                                        <label
                                            htmlFor="tipoEquipo"
                                            className="form__group-label"
                                        >
                                            Tipo Equipo
                                            <br />
                        <Field
                          as="select"
                          type="text"
                          className="form__group-input"
                          placeholder="Tipo Equipo"
                          name="tipoEquipo"
                        >
                          <option value={"0"}>--Seleccionar--</option>
                          <option value="Dcm">DCM</option>
                          <option value="Encoder titan">Encoder Titan</option>
                          <option value="Dcm Vmx">DCM VMX</option>
                          <option value="Rtes Vmx">RTES VMX</option>
                          <option value="Switch">Switch</option>
                          <option value="Router ASR">Router ASR</option>


                        </Field>
                          
                                                
                                        </label>

                                        {errors.tipoEquipo &&
                                        touched.tipoEquipo ? (
                                            <div className="form__group-error">
                                                {errors.tipoEquipo}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label
                                            htmlFor="ip_gestion"
                                            className="form__group-label"
                                        >
                                            Ip Gestión
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                          placeholder="Ip Gestión"
                                                name="ip_gestion"
                                            />
                                        </label>

                                        {errors.ip_gestion &&
                                        touched.ip_gestion ? (
                                            <div className="form__group-error">
                                                {errors.ip_gestion}
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

export default Equipment;
