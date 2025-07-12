import React, { useEffect, useState } from 'react'
import api from "../../utils/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import { ipGestionRegex } from "../../utils/regexValidate";
import stylesEquipment from "./Equipment.module.css";

const UpdateSchemaEquipo = Yup.object().shape({
  nombre: Yup.string(),
  marca: Yup.string(),
  modelo: Yup.string(),
  tipoEquipo: Yup.string(),
  ip_gestion: Yup.string().matches(ipGestionRegex, "Debe ser una ip válida"),
})

const ModalEquipment = ({
  itemId,
  modalOpen,
  setModalOpen,
  title,
  refreshList,
}) => {
  const [dataEquipos, setDataEquipos] = useState(null);

  useEffect(() => {
    if (itemId) {
      console.log(itemId);
      api.getIdEquipo(itemId).then((res) => {
        console.log(res.data);
        setDataEquipos(res.data);
      });
    }
  }, [itemId]);

  if (!dataEquipos) return null;

  return (
    <>
      <Formik
        initialValues={{
          nombre: dataEquipos.nombre || "",
          marca: dataEquipos.marca || "",
          modelo: dataEquipos.modelo || "",
          tipoEquipo: dataEquipos.tipoEquipo || "",
          ip_gestion: dataEquipos.ip_gestion || "",
        }}
        validationSchema={UpdateSchemaEquipo}
        onSubmit={async (values, { resetForm }) => {
          try {
            await api.updateEquipo(itemId, values);
            console.log(values);
            Swal.fire({
              icon: "success",
              title: "Equipo actualizado",
              text: "El equipo Dcm se ha actualizado exitosamente!",
              footer: `<h4>${values.nombre}</h4>
                  <h4>${values.ip_gestion}</h4>
                  
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
            <Form className={stylesEquipment.form__add}>
              <div className={stylesEquipment.rows__group}>
                <div className={stylesEquipment.columns__group}>
                  <div className="form__group">
                    <label
                      htmlFor="nombre"
                      className="form__group-label"
                    >
                      Nombre
                      <br />
                      <Field
                        type="text"
                        className="form__group-input"
                        placeholder="Nombre"
                        name="nombre"
                      />
                    </label>

                    {errors.nombre &&
                      touched.nombre ? (
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

                    {errors.marca &&
                      touched.marca ? (
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
                </div>
                <div className={stylesEquipment.columns__group}>
                  <div className="form__group">
                    <label
                      htmlFor="tipoEquipo"
                      className="form__group-label"
                    >
                      Tipo equipo
                      <br />
                      <Field
                        type="text"
                        className="form__group-input"
                        placeholder="Tipo equipo"
                        name="tipoEquipo"
                      />
                    </label>

                    {errors.tipoEquipo && touched.tipoEquipo ? (
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
                      Ip gestión
                      <br />
                      <Field
                        type="text"
                        className="form__group-input"
                        placeholder="Ip gestión"
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
          </ModalComponent>
        )}
      </Formik>
    </>
  )
}

export default ModalEquipment