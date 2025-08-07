import React, { useEffect, useState } from "react";

import api from "../../utils/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import stylesDcm from "./Dcm.module.css";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import { ipMulticastRegex, ipGestionRegex } from "../../utils/regexValidate";

const UpdateSchemaDcm = Yup.object().shape({
    nombreDcm: Yup.string(),
    urlDcm: Yup.string(),
    ipGestion: Yup.string().matches(ipGestionRegex, "Debe ser una ip válida"),
    port: Yup.string().required("Campo obligatorio"),
});

const ModalDcm = ({ itemId, modalOpen, setModalOpen, title, refreshList }) => {
    const [dataDcm, setDataDcm] = useState(null);

    useEffect(() => {
        if (itemId) {
             
            api.getIdDcm(itemId).then((res) => {
                 
                setDataDcm(res.data);
            });
        }
    }, [itemId]);

    if (!dataDcm) return null;

    return (
        <>
            <Formik
                initialValues={{
                    nombreDcm: dataDcm.nombreDcm || "",
                    urlDcm: dataDcm.urlDcm || "",
                    ipGestion: dataDcm.ipGestion || "",
                    port: dataDcm.port || "",
                }}
                validationSchema={UpdateSchemaDcm}
                onSubmit={async (values, { resetForm }) => {
                    try {
                        await api.updateDcm(itemId, values);
                         
                        Swal.fire({
                            icon: "success",
                            title: "Equipo actualizado",
                            text: "El equipo Dcm se ha actualizado exitosamente!",
                            footer: `<h4>${values.nombreDcm}</h4>
                  <h4>${values.ipGestion}</h4>
                  
                  `,
                        });
                        refreshList();
                        setModalOpen(false);
                        resetForm();
                    } catch (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Ups!!",
                            text: `${
                                error.response?.data?.message ||
                                "Error desconocido"
                            }`,
                        });
                        console.error(error);
                    }
                }}
            >
                {({ errors, touched }) => (
                    <ModalComponent
                        modalOpen={modalOpen}
                        title={title}
                        setModalOpen={setModalOpen}
                    >
                        <Form className={stylesDcm.form__add}>
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
                                            htmlFor="urlDcm"
                                            className="form__group-label"
                                        >
                                            Url Dcm
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Url dcm"
                                                name="urlDcm"
                                            />
                                        </label>

                                        {errors.urlDcm && touched.urlDcm ? (
                                            <div className="form__group-error">
                                                {errors.urlDcm}
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
                    </ModalComponent>
                )}
            </Formik>
        </>
    );
};

export default ModalDcm;
