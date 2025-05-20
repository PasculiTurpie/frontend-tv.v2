import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from '../../utils/api'

const SatelliteSchema = Yup.object().shape({
    satelliteName: Yup.string().required("Campo obligatorio"),
    satelliteUrl: Yup.string()
        .test(
            'starts-with-http',
            'La URL debe comenzar con http:// o https://',
            (value) => value?.startsWith('http://') || value?.startsWith('https://')
        )
        .url('Debe ser una URL válida')
        .required('La URL es obligatoria')
,
    satelliteType: Yup.string()
        .notOneOf(["0", "default"], "Debes seleccionar una opción válida.")
        .required("Campo obligatorio"),
});

const SatelliteForm = () => {
    const [polarizations, setPolarizations] = useState([]);
    const nameInputRef = useRef(null);

    useEffect(() => {
        api.getPolarizations()
            .then((response) => {
                console.log(response)
                setPolarizations(response);
            })
            .catch((error) => {
                console.error("Error fetching satellite data:", error);
            });
    }, []);

    console.log(polarizations);
    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/listar-satelite">Listar</Link>
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
                        satelliteName: "",
                        satelliteUrl:"",
                        satelliteType: "",
                    }}
                    validationSchema={SatelliteSchema}
                    onSubmit={async (values, { resetForm }) => {
                      try {
                        // Enviar los datos a la API
                          const response = await api.createSatelite(values)
                          console.log(response)
                        // Obtener nombre de la polarización
                        const selectedPolarization = polarizations.find(
                          (p) => p._id === values.satelliteType
                        );
                        const polarizationName =
                          selectedPolarization?.typePolarization || "Desconocido";

                        // Mostrar confirmación con SweetAlert2
                        Swal.fire({
                          title: "Satélite guardado exitosamente",
                          icon: "success",
                          html: `
                <p><strong>Nombre Satélite:</strong> ${values.satelliteName}</p>
                <p><strong>Polarización:</strong> ${polarizationName}</p>
              `,
                        }).then(() => {
                          resetForm();
                          nameInputRef.current?.focus();
                        });
                      } catch (error) {
                        console.log( error);
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
                            <h1 className="form__titulo">
                                Ingresa un satélite
                            </h1>
                            <div className="form__group">
                                <label
                                    htmlFor="satelliteName"
                                    className="form__group-label"
                                >
                                    Nombre de Satélite
                                    <br />
                                    <Field
                                        type="text"
                                        className="form__group-input"
                                        placeholder="Nombre"
                                        name="satelliteName"
                                    />
                                </label>
                                {errors.satelliteName &&
                                touched.satelliteName ? (
                                    <div className="form__group-error">
                                        {errors.satelliteName}
                                    </div>
                                ) : null}
                            </div>
                            <div className="form__group">
                                <label
                                    htmlFor="satelliteName"
                                    className="form__group-label"
                                >
                                    Url web
                                    <br />
                                    <Field
                                        type="text"
                                        className="form__group-input"
                                        placeholder="Url web"
                                        name="satelliteUrl"
                                    />
                                </label>
                                {errors.satelliteUrl &&
                                    touched.satelliteUrl ? (
                                    <div className="form__group-error">
                                        {errors.satelliteUrl}
                                    </div>
                                ) : null}
                            </div>
                            <div className="form__group">
                                <label
                                    htmlFor="satelliteType"
                                    className="form__group-label"
                                >
                                    Selecciona la polaridad
                                    <br />
                                    <Field
                                        as="select"
                                        className="form__group-input"
                                        name="satelliteType"
                                    >
                                        <option value={"0"}>
                                            --Seleccionar--
                                        </option>
                                        {polarizations.map((polarization) => {
                                            return (
                                                <option
                                                    key={polarization._id}
                                                    value={polarization._id}
                                                >
                                                    {
                                                        polarization.typePolarization
                                                    }
                                                </option>
                                            );
                                        })}
                                    </Field>
                                </label>
                                {errors.satelliteType &&
                                touched.satelliteType ? (
                                    <div className="form__group-error">
                                        {errors.satelliteType}
                                    </div>
                                ) : null}
                            </div>
                            <button
                                type="submit"
                                className="button btn-primary"
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

export default SatelliteForm;
