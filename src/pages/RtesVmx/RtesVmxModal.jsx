import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import stylesRtesVmx from "./RtesVmx.module.css";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import { ipMulticastRegex } from "../../utils/regexValidate";

const UpdateSchemaRtesVmx = Yup.object().shape({
    nombreRtesVmx: Yup.string(),
    urlRtes: Yup.string(),
    mcastIn: Yup.string().matches(
        ipMulticastRegex,
        "Debe ser una multicast válida"
    ),
    mcastOut: Yup.string().matches(
        ipMulticastRegex,
        "Debe ser una multicast válida"
    ),
});

const RtesVmxModal = ({
    itemId,
    modalOpen,
    setModalOpen,
    title,
    refreshList,
}) => {
    const [dataRtesVmx, setDataRtesVmx] = useState(null);

    useEffect(() => {
        if (itemId) {
            console.log(itemId);
            api.getIdRtesVmx(itemId).then((res) => {
                console.log(res.data);
                setDataRtesVmx(res.data);
            });
        }
    }, [itemId]);

    if (!dataRtesVmx) return null;

    return (
        <>
            <Formik
                initialValues={{
                    nombreRtesVmx: dataRtesVmx.nombreRtesVmx || "",
                    urlRtes: dataRtesVmx.urlRtes || "",
                    mcastIn: dataRtesVmx.mcastIn || "",
                    mcastOut: dataRtesVmx.mcastOut || "",
                }}
                validationSchema={UpdateSchemaRtesVmx}
                onSubmit={async (values, { resetForm }) => {
                    try {
                        await api.updateRtesVmx(itemId, values);
                        console.log(values);
                        Swal.fire({
                            icon: "success",
                            title: "Equipo actualizado",
                            text: "El equipo Dcm se ha actualizado exitosamente!",
                            footer: `<h4>${values.nombreRtesVmx}</h4>
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
              <Form className={stylesRtesVmx.form__add}>
                <div className={stylesRtesVmx.rows__group}>
                  <div className={stylesRtesVmx.columns__group}>
                    <div className="form__group">
                      <label
                        htmlFor="nombreRtesVmx"
                        className="form__group-label"
                      >
                        Nombre Rtes
                        <br />
                        <Field
                          type="text"
                          className="form__group-input"
                          placeholder="Nombre Rtes"
                          name="nombreRtesVmx"
                        />
                      </label>

                      {errors.nombreRtesVmx && touched.nombreRtesVmx ? (
                        <div className="form__group-error">
                          {errors.nombreRtesVmx}
                        </div>
                      ) : null}
                    </div>
                    <div className="form__group">
                      <label
                        htmlFor="urlRtes"
                        className="form__group-label"
                      >
                        Url Rtes
                        <br />
                        <Field
                          type="text"
                          className="form__group-input"
                          placeholder="Url Rtes"
                          name="urlRtes"
                        />
                      </label>

                      {errors.urlRtes && touched.urlRtes ? (
                        <div className="form__group-error">
                          {errors.urlRtes}
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
                  <div className={stylesRtesVmx.columns__group}>
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

export default RtesVmxModal;
