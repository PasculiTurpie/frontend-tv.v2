import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const Nodo = () => {

    const [dataSignal, setDataSignal] = useState([])

    const getAllSignal = () =>{
        api.getSignal()
        .then((res)=>{
            console.log(res.data)
            setDataSignal(res.data)
        })
    }
    useEffect(()=>{
getAllSignal()
    },[])
    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/nodo-listar">Listar</Link>
                        </li>
                        <li
                            className="breadcrumb-item active"
                            aria-current="page"
                        >
                            Formulario
                        </li>
                    </ol>
                </nav>
                <Formik>
                    <Form>
                     <div className="form__group">
                            <label
                                htmlFor="nombre"
                                className="form__group-label"
                            >
                                Señal
                                <br />
                                <Field
                                as="select"
                                    className="form__group-input"
                                    placeholder="Nombre equipo"
                                    name="nombre"
                                >
                                    <option>--Seleccionar--</option>
                                    {
                                        dataSignal?.map((signal)=>(             
                                            <option key={signal._id} value={signal._id}>{signal.nameChannel.toUpperCase()}</option>
                                        ))}

                                </Field>
                            </label>
                            {/* {errors.nombre && touched.nombre && (
                                                        <div className="form__group-error">{errors.nombre}</div>
                                                    )} */}
                        </div>
                    <div className="form__group">
                            <label
                                htmlFor="nombre"
                                className="form__group-label"
                            >
                                Nodo
                                <br />
                                <Field
                                as="select"
                                    className="form__group-input"
                                    placeholder="Nombre equipo"
                                    name="nombre"
                                >
                                    <option value="">--Seleccionar--</option>
                                   

                                </Field>
                            </label>
                            {/* {errors.nombre && touched.nombre && (
                                                        <div className="form__group-error">{errors.nombre}</div>
                                                    )} */}
                        </div>
                        <button className="button btn-primary">Crear nodo</button>
                       
                    </Form>
                </Formik>
            </div>
        </>
    );
};

export default Nodo;
