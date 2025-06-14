import React, { useEffect, useState } from "react";

import api from "../../utils/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import stylesTitan from "./Titan.module.css";
import ModalComponent from "../../components/ModalComponent/ModalComponent";

const ipMulticastRegex =
    /^(2(?:[0-4]\d|5[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5]))$/;

const ipGestionRegex = /172.19.14\.\d/;

const UpdateSchemaTitan = Yup.object().shape({
    nombreTitan: Yup.string(),
    urlTitan: Yup.string().matches(
        /(?:https?\:\/\/\w+\.\w+\.\w+.+)/,
        "Ingresa una url válida"
    ),
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

const ModalTitan = ({
    itemId,
    modalOpen,
    setModalOpen,
    title,
    refreshList,
}) => {
    const [dataTitans, setDataTitans] = useState(null);

    useEffect(() => {
        if (itemId) {
            console.log(itemId);
            api.getIdTitan(itemId).then((res) => {
                console.log(res.data);
                setDataTitans(res.data);
            });
        }
    }, [itemId]);

    if (!dataTitans) return null;
    return (
        <>
            <Formik
                initialValues={{
                    nombreTitan: dataTitans.nombreTitan || "",
                    urlTitan: dataTitans.urlTitan || "",
                    mcastIn: dataTitans.mcastIn || "",
                    mcastOut: dataTitans.mcastOut || "",
                    ipGestion: dataTitans.ipGestion || "",
                }}
                validationSchema={UpdateSchemaTitan}
                onSubmit={async (values, { resetForm }) => {
                    try {
                        await api.updateTitan(itemId, values);
                        console.log(values);
                        Swal.fire({
                            icon: "success",
                            title: "Equipo actualizado",
                            text: "El equipo Titan se ha actualizado exitosamente!",
                            footer: `<h4>${values.nombreTitan}</h4>
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
                        <Form className={stylesTitan.form__add}>
                            <div className={stylesTitan.rows__group}>
                                <div className={stylesTitan.columns__group}>
                                    <div className="form__group">
                                        <label
                                            htmlFor="nombreTitan"
                                            className="form__group-label"
                                        >
                                            Nombre Titan
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre titan"
                                                name="nombreTitan"
                                            />
                                        </label>

                                        {errors.nombreTitan &&
                                        touched.nombreTitan ? (
                                            <div className="form__group-error">
                                                {errors.nombreTitan}
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="form__group">
                                        <label
                                            htmlFor="urlTitan"
                                            className="form__group-label"
                                        >
                                            Url Titan
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Url imagen"
                                                name="urlTitan"
                                            />
                                        </label>

                                        {errors.urlTitan && touched.urlTitan ? (
                                            <div className="form__group-error">
                                                {errors.urlTitan}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label
                                            htmlFor="urlTitan"
                                            className="form__group-label"
                                        >
                                            Multicast In Titan
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder=" Multicast In"
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
                                <div className={stylesTitan.columns__group}>
                                    <div className="form__group">
                                        <label
                                            htmlFor="mcastOut"
                                            className="form__group-label"
                                        >
                                            Multicast Out Titan
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

                                    <div className="form__group">
                                        <label
                                            htmlFor="ipGestion"
                                            className="form__group-label"
                                        >
                                            Ip Gestión Titan
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
                    </ModalComponent>
                )}
            </Formik>
        </>
    );
};

export default ModalTitan;
