import React, { useEffect, useState } from "react";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import api from "../../utils/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

const EditSchemaUser = Yup.object().shape({
    username: Yup.string(),
    email: Yup.string().email("Debe ser un correo válido"),
    profilePicture: Yup.string()
        .test(
            "starts-with-http",
            "La URL debe comenzar con http:// o https://",
            (value) =>
                value?.startsWith("http://") || value?.startsWith("https://")
        )
        .url("Debe ser una URL válida"),
    password: Yup.string()
        .nullable()
        .test(
            "optional-password",
            "No cumple con las reglas",
            function (value) {
                if (!value) return true;
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
                    value
                );
            }
        ),
    confirmPassword: Yup.string().oneOf(
        [Yup.ref("password")],
        "Las contraseñas no coincidir"
    ),
    rol: Yup.string(),
});

const ModalUser = ({ itemId, modalOpen, setModalOpen, title, refreshList }) => {
    const [dataUser, setDataUser] = useState(null);

    useEffect(() => {
        if (itemId) {
            api.getUserId(itemId).then((res) => {
                setDataUser(res);
            });
        }
    }, [itemId]);

    if (!dataUser) return null;

    return (
        <Formik
            enableReinitialize={true}
            initialValues={{
                username: dataUser.username || "",
                email: dataUser.email || "",
                password: "",
                confirmPassword: "",
                profilePicture: dataUser.profilePicture || "",
                rol: dataUser.rol || "",
            }}
            validationSchema={EditSchemaUser}
            onSubmit={async (values, { resetForm }) => {
                try {
                    await api.updateUserId(itemId, values);
                    Swal.fire({
                        icon: "success",
                        title: "Usuario actualizado",
                        text: "El usuario se ha actualizado exitosamente!",
                        footer: `<h4>${values.email}</h4>`,
                    });
                    refreshList();
                    setModalOpen(false);
                    resetForm();
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Ups!!",
                        text: `${
                            error.response?.data?.message || "Error desconocido"
                        }`,
                    });
                    console.error(error);
                }
            }}
        >
            {() => (
                <ModalComponent
                    modalOpen={modalOpen}
                    title={title}
                    setModalOpen={setModalOpen}
                >
                    <Form className="grid-cols-2">
                        <div>
                            <div className="form__group">
                                <label className="form__group-label">
                                    Nombre usuario
                                    <br />
                                    <Field
                                        type="text"
                                        className="form__group-input"
                                        placeholder="Nombre"
                                        name="username"
                                    />
                                    <ErrorMessage
                                        name="username"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </label>
                            </div>
                            <div className="form__group">
                                <label className="form__group-label">
                                    Email
                                    <br />
                                    <Field
                                        type="text"
                                        className="form__group-input"
                                        placeholder="Email"
                                        name="email"
                                    />
                                    <ErrorMessage
                                        name="email"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </label>
                            </div>
                            <div className="form__group">
                                <label className="form__group-label">
                                    Avatar
                                    <br />
                                    <Field
                                        type="text"
                                        className="form__group-input"
                                        placeholder="Avatar"
                                        name="profilePicture"
                                    />
                                    <ErrorMessage
                                        name="profilePicture"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </label>
                            </div>
                        </div>

                        <div>
                            <div className="form__group">
                                <label className="form__group-label">
                                    Rol
                                    <br />
                                    <Field
                                        as="select"
                                        className="form__group-input"
                                        name="rol"
                                    >
                                        <option value="0">Seleccionar</option>
                                        <option value="admin">admin</option>
                                        <option value="user">user</option>
                                    </Field>
                                    <ErrorMessage
                                        name="rol"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </label>
                            </div>
                            <div className="form__group">
                                <label className="form__group-label">
                                    Contraseña
                                    <br />
                                    <Field
                                        type="password"
                                        className="form__group-input"
                                        placeholder="Contraseña"
                                        name="password"
                                    />
                                    <ErrorMessage
                                        name="password"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </label>
                            </div>
                            <div className="form__group">
                                <label className="form__group-label">
                                    Confirmar contraseña
                                    <br />
                                    <Field
                                        type="password"
                                        className="form__group-input"
                                        placeholder="Confirmar contraseña"
                                        name="confirmPassword"
                                    />
                                    <ErrorMessage
                                        name="confirmPassword"
                                        component="div"
                                        className="form__group-error"
                                    />
                                </label>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="button btn-primary btn-adjust"
                        >
                            Actualizar
                        </button>
                    </Form>
                </ModalComponent>
            )}
        </Formik>
    );
};

export default ModalUser;
