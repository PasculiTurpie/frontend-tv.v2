import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import "./Channel.css";

const UpdateSchemaChannel = Yup.object().shape({
    nameChannel: Yup.string().required("Nombre del canal requerido"),
    numberChannelCn: Yup.string().required("Número canal Norte requerido"),
    numberChannelSur: Yup.string().required("Número canal Sur requerido"),
    logoChannel: Yup.string()
        .url("Debe ser una URL válida")
        .required("Logo requerido"),
    severidadChannel: Yup.string().required("Severidad requerida"),
    tipoServicio: Yup.string().required("Tipo de servicio requerido"),
    tipoTecnologia: Yup.string().required("Tipo de tecnología requerido"),
    source: Yup.string().required("Fuente requerida"),
});

const ModalChannel = ({
    itemId,
    modalOpen,
    setModalOpen,
    title,
    refreshList,
}) => {
  const [channelData, setChannelData] = useState(null);
  
  

    useEffect(() => {
        if (itemId) {
            api.getIdSignal(itemId).then((res) => {
                setChannelData(res.data);
            });
        }
    }, [itemId]);

    if (!channelData) return null;

    return (
        <Formik
            enableReinitialize
            initialValues={{
                nameChannel: channelData.nameChannel || "",
                numberChannelCn: channelData.numberChannelCn || "",
                numberChannelSur: channelData.numberChannelSur || "",
                logoChannel: channelData.logoChannel || "",
                severidadChannel: channelData.severidadChannel || "",
                tipoServicio: channelData.tipoServicio || "",
                tipoTecnologia: channelData.tipoTecnologia || "",
                source: channelData.source || "",
            }}
            validationSchema={UpdateSchemaChannel}
            onSubmit={async (values, { resetForm }) => {
                try {
                    await api.updateSignal(itemId, values);
                    Swal.fire({
                        icon: "success",
                        title: "Canal actualizado",
                        text: `El canal "${values.nameChannel}" fue actualizado exitosamente.`,
                    });
                    refreshList();
                    setModalOpen(false);
                    resetForm();
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text:
                            error.response?.data?.message ||
                            "No se pudo actualizar",
                    });
                    console.error("Error al actualizar canal:", error);
                }
            }}
        >
            {({ errors, touched }) => (
                <ModalComponent
                    modalOpen={modalOpen}
                    title={title}
                    setModalOpen={setModalOpen}
                >
                    <Form className="form__add">
                        <div className="rows__group">
                            <div className="columns__group">
                                <div className="form__group">
                                    <label
                                        htmlFor="nameChannel"
                                        className="form__group-label"
                                    >
                                        Nombre Canal
                                    </label>
                                    <Field
                                        className="form__group-input"
                                        name="nameChannel"
                                        placeholder="Nombre canal"
                                    />
                                    <ErrorMessage
                                        name="nameChannel"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </div>

                                <div className="form__group">
                                    <label
                                        htmlFor="numberChannelCn"
                                        className="form__group-label"
                                    >
                                        Número Canal Norte
                                    </label>
                                    <Field
                                        className="form__group-input"
                                        name="numberChannelCn"
                                        placeholder="Ej: 11"
                                    />
                                    <ErrorMessage
                                        name="numberChannelCn"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </div>

                                <div className="form__group">
                                    <label
                                        htmlFor="numberChannelSur"
                                        className="form__group-label"
                                    >
                                        Número Canal Sur
                                    </label>
                                    <Field
                                        className="form__group-input"
                                        name="numberChannelSur"
                                        placeholder="Ej: 10"
                                    />
                                    <ErrorMessage
                                        name="numberChannelSur"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </div>

                                <div className="form__group">
                                    <label
                                        htmlFor="logoChannel"
                                        className="form__group-label"
                                    >
                                        Logo URL
                                    </label>
                                    <Field
                                        className="form__group-input"
                                        name="logoChannel"
                                        placeholder="URL del logo"
                                    />
                                    <ErrorMessage
                                        name="logoChannel"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </div>
                            </div>

                            <div className="columns__group">
                                <div className="form__group">
                                    <label
                                        htmlFor="severidadChannel"
                                        className="form__group-label"
                                    >
                                        Severidad
                                    </label>
                                    <Field
                                        as="select"
                                        className="form__group-input"
                                        name="severidadChannel"
                                    >
                                        <option value="">
                                            Seleccionar severidad
                                        </option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </Field>
                                    <ErrorMessage
                                        name="severidadChannel"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </div>

                                <div className="form__group">
                                    <label
                                        htmlFor="tipoServicio"
                                        className="form__group-label"
                                    >
                                        Tipo Servicio
                                    </label>
                                    <Field
                                        as="select"
                                        className="form__group-input"
                                        name="tipoServicio"
                                    >
                                        <option value="">
                                            Seleccionar servicio
                                        </option>
                                        <option value="Radio">Radio</option>
                      <option value="Televisión">Televisión</option>
                                    </Field>
                                    <ErrorMessage
                                        name="tipoServicio"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </div>

                                <div className="form__group">
                                    <label
                                        htmlFor="tipoTecnologia"
                                        className="form__group-label"
                                    >
                                        Tecnología
                                    </label>
                                    <Field
                                        as="select"
                                        className="form__group-input"
                                        name="tipoTecnologia"
                                    >
                                        <option value="">
                                            Seleccionar tecnología
                                        </option>
                                        <option value="FCA">FCA</option>
                                        <option value="IP">IP</option>
                                        <option value="SAT">SAT</option>
                                    </Field>
                                    <ErrorMessage
                                        name="tipoTecnologia"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </div>

                                <div className="form__group">
                                    <label
                                        htmlFor="source"
                                        className="form__group-label"
                                    >
                                        Fuente
                                    </label>
                    <Field
                      as="select"
                      className="form__group-input"
                      name="source"
                    >
                      <option value="">
                        --Seleccionar--
                      </option>
                      <option value="STGO">Santiago</option>
                      <option value="VLDV">Valdivia</option>
                    </Field>
                    <ErrorMessage
                      name="source"
                      component="div"
                      className="form__group-error"
                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal__actions">
                            <button
                                type="submit"
                                className="button btn-primary"
                            >
                                Guardar
                            </button>
                            <button
                                type="button"
                                className="button btn-secondary"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </Form>
                </ModalComponent>
            )}
        </Formik>
    );
};

export default ModalChannel;
