import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import hidden__Password from "../../../public/images/hide-password.png";
import show__Password from "../../../public/images/show-password.png";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";

const LoginSchema = Yup.object().shape({
    email: Yup.string().trim().email("Email inválido").required("Campo obligatorio"),
    password: Yup.string().required("Campo obligatorio"),
});

const Login = () => {
    const { user, setUser, setIsAuth } = useContext(UserContext);
    const [showPassword, setShowPassword] = useState(false);

    console.log(user);

    const navigate = useNavigate();

    const toggleShowPassword = () => setShowPassword(!showPassword);


        api.getSignal().then((res) => {
            const dataSignal = res[0];
            console.log(dataSignal.equipos.satelite._id)
        })


    return (
        <>
            <div className="outlet-main">
                <Formik
                    initialValues={{
                        email: "",
                        password: "",
                    }}
                    validationSchema={LoginSchema}
                    onSubmit={async (values, { resetForm }) => {
                        try {
                            await axios
                                .post(
                                    "http://localhost:3000/api/v2/login",
                                    values,
                                    { withCredentials: true }
                                )
                                .then((response) => {
                                    console.log(response.data);
                                    /* setUser(response.data.) */
                                    Swal.fire({
                                        position: "top-end",
                                        icon: "success",
                                        title: "Usuario logueado correctamente",
                                        showConfirmButton: false,
                                        timer: 1500,
                                    });
                                    setUser(response.data.user);
                                    resetForm();
                                    setIsAuth(true);
                                    navigate("/");
                                });
                        } catch (error) {
                            console.log(error);
                            Swal.fire({
                                icon: "error",
                                title: "Ups!!",
                                text: `${error.response.data.message}`,
                                footer: `${values.email}`,
                            });
                        }
                    }}
                >
                    {({ errors, touched, setFieldValue }) => (
                        <Form className="form__add">
                            <h1 className="form__titulo">Login</h1>
                            <div className="form__group">
                                <label
                                    htmlFor="username"
                                    className="form__group-label"
                                >
                                    Email:
                                    <br />
                                    <Field
                                        className="form__group-input"
                                        type="email"
                                        name="email"
                                        id="email"
                                        autoComplete="on"
                                        onChange={(e) => setFieldValue("email", e.target.value.toLowerCase())}
                                    />
                                </label>
                                {errors.email && touched.email ? (
                                    <div className="form__group-error">
                                        {errors.email}
                                    </div>
                                ) : null}
                            </div>
                            <div
                                className="form__group"
                                style={{ position: "relative" }}
                            >
                                <label
                                    htmlFor="password"
                                    className="form__group-label"
                                >
                                    Password:
                                    <br />
                                    <Field
                                        className="form__group-input"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        id="password"
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        className="icon__password-toggle"
                                        onClick={toggleShowPassword}
                                        style={{
                                            position: "absolute",
                                            right: 5,
                                            top: 26,
                                        }}
                                    >
                                        {showPassword ? (
                                            <img
                                                className="icon__password"
                                                src={hidden__Password}
                                                alt="ocultar"
                                            />
                                        ) : (
                                            <img
                                                className="icon__password"
                                                src={show__Password}
                                                alt="mostrar"
                                            />
                                        )}
                                    </button>
                                </label>
                                {errors.password && touched.password ? (
                                    <div className="form__group-error">
                                        {errors.password}
                                    </div>
                                ) : null}
                            </div>
                            <button
                                className="button btn-success"
                                type="submit"
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

export default Login;
