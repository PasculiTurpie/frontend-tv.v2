import React, { useEffect, useState } from "react";

import api from "../../utils/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import stylesDcmVmx from "./DcmVmx.module.css";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import { ipMulticastRegex, ipGestionRegex } from "../../utils/regexValidate";

const UpdateSchemaDcmVmx = Yup.object().shape({
    nombreDcmVmx: Yup.string(),
    urlDcmVmx: Yup.string(),
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

const ModalDcmVmx = ({
    itemId,
    modalOpen,
    setModalOpen,
    title,
    refreshList,
}) => {
    const [dataDcmVmx, setDataDcmVmx] = useState(null);

    useEffect(() => {
        if (itemId) {
            console.log(itemId);
            api.getIdDcmVmx(itemId).then((res) => {
                console.log(res.data);
                setDataDcmVmx(res.data);
            });
        }
    }, [itemId]);

    if (!dataDcmVmx) return null;

    return (
        <>
            <Formik
                initialValues={{
                    nombreDcmVmx: dataDcmVmx.nombreDcmVmx || "",
                    mcastIn: dataDcmVmx.mcastIn || "",
                    mcastOut: dataDcmVmx.mcastOut || "",
                    ipGestion: dataDcmVmx.ipGestion || "",
                    urlDcmVmx: dataDcmVmx.urlDcmVmx || "",
                }}
                validationSchema={UpdateSchemaDcmVmx}
                onSubmit={async (values, { resetForm }) => {
                    try {
                        await api.updateDcmVmx(itemId, values);
                        console.log(values);
                        Swal.fire({
                            icon: "success",
                            title: "Equipo actualizado",
                            text: "El equipo Dcm se ha actualizado exitosamente!",
                            footer: `<h4>${values.nombreDcmVmx}</h4>
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
                        <Form className={stylesDcmVmx.form__add}>
                        <div className={stylesDcmVmx.rows__group}>
                                                        <div className={stylesDcmVmx.columns__group}>
                            <div className="form__group">
                                <label
                                    htmlFor="nombreDcmVmx"
                                    className="form__group-label"
                                >
                                    Nombre Dcm
                                    <br />
                                    <Field
                                        type="text"
                                        className="form__group-input"
                                        placeholder="Nombre dcm"
                                        name="nombreDcmVmx"
                                    />
                                </label>

                                {errors.nombreDcmVmx && touched.nombreDcmVmx ? (
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
                                    Url Dcm
                                    <br />
                                    <Field
                                        type="text"
                                        className="form__group-input"
                                        placeholder="Url dcm"
                                        name="urlDcmVmx"
                                    />
                                </label>

                                {errors.urlDcmVmx && touched.urlDcmVmx ? (
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

                                {errors.ipGestion && touched.ipGestion ? (
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
                    </ModalComponent>
                )}
            </Formik>
        </>
    );
};

export default ModalDcmVmx;
