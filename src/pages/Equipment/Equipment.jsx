import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ipGestionRegex } from "../../utils/regexValidate";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import stylesEquipment from "./Equipment.module.css";

const SchemaEquipos = Yup.object().shape({
    nombre: Yup.string()
        .trim("No debe tener espacios al inicio o al final")
        .required("Campo obligatorio"),
    marca: Yup.string()
        .trim("No debe tener espacios al inicio o al final")
        .required("Campo obligatorio"),
    modelo: Yup.string()
        .trim("No debe tener espacios al inicio o al final")
        .required("Campo obligatorio"),
    tipoNombre: Yup.string().required("Campo obligatorio"),
    ip_gestion: Yup.string()
        .trim("No debe tener espacios al inicio o al final")
        .required("Campo obligatorio")
        .matches(ipGestionRegex, "Debe ser una ip válida"),
});

const SchemaTipoEquipos = Yup.object().shape({
    tipoNombre: Yup.string()
        .trim("No debe tener espacios al inicio o al final")
        .required("Campo obligatorio"),
});

const Equipment = () => {
    const [equipments, setEquipments] = useState([]);
    const [tipoEquipments, setTipoEquipments] = useState([]);

    const dataEquipo = () => {
        api.getTipoEquipo().then((response) => {
            setTipoEquipments(response.data);
        });
    };

    const refreshList = () => {
        dataEquipo();
    };

    useEffect(() => {
        refreshList();
    }, []);

    return (
        <div className="outlet-main">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/equipment-list">Listar</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Formulario
                    </li>
                </ol>
            </nav>

            <div className={stylesEquipment.double__form}>
                {/* Formulario Equipo */}
                <Formik
                    initialValues={{
                        nombre: "",
                        marca: "",
                        modelo: "",
                        tipoNombre: "",
                        ip_gestion: "",
                    }}
                    validationSchema={SchemaEquipos}
                    onSubmit={async (values, { resetForm }) => {
                        const trimmedValues = {
                            ...values,
                            nombre: values.nombre.trim(),
                            marca: values.marca.trim(),
                            modelo: values.modelo.trim(),
                            ip_gestion: values.ip_gestion.trim(),
                            tipoNombre: values.tipoNombre.trim(),
                        };

                        try {
                            const response = await api.createEquipo(trimmedValues);
                            Swal.fire({
                                title: "Equipo guardado exitosamente",
                                icon: "success",
                                html: `
                  <p><strong>Nombre Equipo:</strong> ${trimmedValues.nombre}</p>
                  <p><strong>IP Gestión:</strong> ${trimmedValues.ip_gestion}</p>
                `,
                            });
                            resetForm();
                        } catch (error) {
                            Swal.fire({
                                title: "Error",
                                icon: "error",
                                text: `Duplicidad de datos`,
                                footer: `${error.response?.data?.message || "Error desconocido"}`,
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
                                        <label htmlFor="nombre" className="form__group-label">
                                            Nombre Equipo
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre equipo"
                                                name="nombre"
                                            />
                                        </label>
                                        {errors.nombre && touched.nombre && (
                                            <div className="form__group-error">{errors.nombre}</div>
                                        )}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="marca" className="form__group-label">
                                            Marca
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Marca"
                                                name="marca"
                                            />
                                        </label>
                                        {errors.marca && touched.marca && (
                                            <div className="form__group-error">{errors.marca}</div>
                                        )}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="modelo" className="form__group-label">
                                            Modelo
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Modelo"
                                                name="modelo"
                                            />
                                        </label>
                                        {errors.modelo && touched.modelo && (
                                            <div className="form__group-error">{errors.modelo}</div>
                                        )}
                                    </div>
                                </div>

                                <div className={stylesEquipment.columns__group}>
                                    <div className="form__group">
                                        <label htmlFor="tipoNombre" className="form__group-label">
                                            Tipo Equipo
                                            <br />
                                            <Field
                                                as="select"
                                                className="form__group-input"
                                                name="tipoNombre"
                                            >
                                                <option value="">--Seleccionar--</option>
                                                {tipoEquipments.map((tipoEquipment) => (
                                                    <option key={tipoEquipment._id} value={tipoEquipment._id}>
                                                        {tipoEquipment.tipoNombre.toUpperCase()}
                                                    </option>
                                                ))}
                                            </Field>
                                        </label>
                                        {errors.tipoNombre && touched.tipoNombre && (
                                            <div className="form__group-error">{errors.tipoNombre}</div>
                                        )}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="ip_gestion" className="form__group-label">
                                            IP Gestión
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="IP Gestión"
                                                name="ip_gestion"
                                            />
                                        </label>
                                        {errors.ip_gestion && touched.ip_gestion && (
                                            <div className="form__group-error">{errors.ip_gestion}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="button btn-primary">
                                Enviar
                            </button>
                        </Form>
                    )}
                </Formik>

                <hr />

                {/* Formulario Tipo Equipo */}
                <Formik
                    initialValues={{ tipoNombre: "" }}
                    validationSchema={SchemaTipoEquipos}
                    onSubmit={async (values, { resetForm }) => {
                        const trimmedValues = {
                            tipoNombre: values.tipoNombre.trim(),
                        };

                        try {
                            const response = await api.createTipoEquipo(trimmedValues);
                            Swal.fire({
                                title: "Tipo de equipo guardado exitosamente",
                                icon: "success",
                                html: `
                  <p><strong>Tipo:</strong> ${trimmedValues.tipoNombre}</p>
                `,
                            });
                            resetForm();
                            refreshList();
                        } catch (error) {
                            Swal.fire({
                                title: "Error",
                                icon: "error",
                                text: `Duplicidad de datos`,
                                footer: `${error.response?.data?.message || "Error desconocido"}`,
                            });
                        }
                    }}
                >
                    {({ errors, touched }) => (
                        <Form className="form__add">
                            <h1 className="form__titulo">Registrar Tipo Equipo</h1>
                            <div className={stylesEquipment.rows__group}>
                                <div className={stylesEquipment.columns__group}>
                                    <div className="form__group">
                                        <label htmlFor="tipoNombre" className="form__group-label">
                                            Tipo equipo
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Tipo equipo"
                                                name="tipoNombre"
                                            />
                                        </label>
                                        {errors.tipoNombre && touched.tipoNombre && (
                                            <div className="form__group-error">{errors.tipoNombre}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="button btn-primary">
                                Enviar
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default Equipment;
