import React, { useEffect, useState } from "react";
import "./ModalForm.css";
import "../../pages/Satellite/Satellite.css";
import { Modal } from "antd";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";

// Esquema de validación
const EditSchema = Yup.object().shape({
    satelliteName: Yup.string().required("Campo obligatorio"),
    satelliteUrl: Yup.string()
        .url("URL no válida")
        .required("Campo obligatorio"),
    satelliteType: Yup.string().required("Selecciona una opción"),
});

const ModalForm = ({
    isModalOpen,
    handleOk,
    handleCancel,
    itemId,
    refreshList,
}) => {
    const [polarizations, setPolarizations] = useState([]);
    const [initialValues, setInitialValues] = useState(null);

    useEffect(() => {
        if (itemId) {
            axios
                .get(`http://localhost:3000/api/v2/satellite/${itemId}`)
                .then((res) => {
                    const data = res.data;
                    setInitialValues({
                        satelliteName: data.satelliteName,
                        satelliteUrl: data.satelliteUrl,
                        satelliteType: data.satelliteType._id, // Asegura que sea el ID
                    });
                });

            axios
                .get(`http://localhost:3000/api/v2/polarization`)
                /* polarizations.find((item) => ) */
                    .then((res) => {
                    setPolarizations(res.data);
                });
        }
    }, [itemId]);

    const handleSubmit = async (values) => {
        try {
            await axios.put(
                `http://localhost:3000/api/v2/satellite/${itemId}`,
                values
            );
            Swal.fire(
                "Actualizado",
                "El satélite fue actualizado correctamente",
                "success"
            );
            handleOk(); // cierra el modal
            refreshList(); // recarga la lista si la función está disponible
        } catch (error) {
            console.error("Error al actualizar:", error);
            Swal.fire("Error", "No se pudo actualizar el satélite", "error");
        }
    };

    return (
        <Modal
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
        >
            {initialValues && (
                <Formik
                    initialValues={initialValues}
                    validationSchema={EditSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ errors, touched }) => (
                        <Form className="form form__modal">
                            <h1 className="form__titulo">Editar satélite</h1>

                            <div className="form__group">
                                <label>
                                    Nombre Satélite
                                    <br />
                                    <Field
                                        name="satelliteName"
                                        type="text"
                                        className="form__group-input"
                                        placeholder="Nombre"
                                    />
                                    {errors.satelliteName &&
                                        touched.satelliteName && (
                                            <div className="form__group-error">
                                                {errors.satelliteName}
                                            </div>
                                        )}
                                </label>
                            </div>

                            <div className="form__group">
                                <label>
                                    URL web
                                    <br />
                                    <Field
                                        name="satelliteUrl"
                                        type="text"
                                        className="form__group-input"
                                        placeholder="URL"
                                    />
                                    {errors.satelliteUrl &&
                                        touched.satelliteUrl && (
                                            <div className="form__group-error">
                                                {errors.satelliteUrl}
                                            </div>
                                        )}
                                </label>
                            </div>

                            <div className="form__group">
                                <label>
                                    Polarización
                                    <br />
                                    <Field
                                        name="satelliteType"
                                        as="select"
                                        className="form__group-input"
                                    >
                                        <option value="">
                                            --Seleccionar--
                                        </option>
                                        {polarizations.map((polarization) => (
                                            <option
                                                key={polarization._id}
                                                value={polarization._id}
                                            >
                                                {polarization.typePolarization}
                                            </option>
                                        ))}
                                    </Field>
                                    {errors.satelliteType &&
                                        touched.satelliteType && (
                                            <div className="form__group-error">
                                                {errors.satelliteType}
                                            </div>
                                        )}
                                </label>
                            </div>

                            <div className="form__group">
                                <button
                                    className="button btn-primary"
                                    type="submit"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </Modal>
    );
};

export default ModalForm;
