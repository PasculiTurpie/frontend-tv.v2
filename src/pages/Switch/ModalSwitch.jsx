import React, { useEffect, useState } from "react";

import api from "../../utils/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import stylesSwitch from "./Switch.module.css";
import ModalComponent from "../../components/ModalComponent/ModalComponent";


const UpdateSchemaSwitch = Yup.object().shape({
  nameSwitch: Yup.string(),
  urlConmutador: Yup.string(),
  interfacePort: Yup.string(),
  vlanInterface: Yup.string()
});

const ModalSwitch = ({ itemId,
  modalOpen,
  setModalOpen,
  title,
  refreshList, }) => {
  
  const [dataSwitchs, setDataSwitchs] = useState(null);

  useEffect(() => {
    if (itemId) {
      console.log(itemId);
      api.getIdSwitch(itemId).then((res) => {
        console.log(res.data);
        setDataSwitchs(res.data);
      });
    }
  }, [itemId]);

  if (!dataSwitchs) return null;


  return (
    <>
      <Formik
        initialValues={{
          nameSwitch: dataSwitchs.nameSwitch || "" ,
          urlConmutador: dataSwitchs.urlConmutador || "" ,
          interfacePort: dataSwitchs.interfacePort || "" ,
          vlanInterface: dataSwitchs.vlanInterface || "" ,
        }}
        validationSchema={UpdateSchemaSwitch}
        onSubmit={async (values, { resetForm }) => {
          try {
            await api.updateSwitch(itemId, values);
            console.log(values);
            Swal.fire({
              icon: "success",
              title: "Equipo actualizado",
              text: "El elemento switch se ha actualizado exitosamente!",
              footer: `<h4>${values.nameSwitch}</h4>
                  <h4>${values.interfacePort}</h4>
                  
                  `,
            });
            refreshList();
            setModalOpen(false);
            resetForm();
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Ups!!",
              text: `${error.response?.data?.message ||
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
            <Form className={stylesSwitch.form__add}>
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

                    {errors.nameSwitch && touched.nameSwitch ? (
                      <div className="form__group-error">
                        {errors.nameSwitch}
                      </div>
                    ) : null}
                  </div>
                  <div className="form__group">
                    <label
                      htmlFor="urlConmutador"
                      className="form__group-label"
                    >
                      Url imagen switch
                      <br />
                      <Field
                        type="text"
                        className="form__group-input"
                        placeholder="Url switch"
                        name="urlConmutador"
                      />
                    </label>

                    {errors.urlConmutador && touched.urlConmutador ? (
                      <div className="form__group-error">
                        {errors.urlConmutador}
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

                    {errors.interfacePort && touched.interfacePort ? (
                      <div className="form__group-error">
                        {errors.interfacePort}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className={stylesSwitch.columns__group}>
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

                    {errors.vlanInterface && touched.vlanInterface ? (
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
          </ModalComponent>
        )}
      </Formik>
    </>
  )
}

export default ModalSwitch