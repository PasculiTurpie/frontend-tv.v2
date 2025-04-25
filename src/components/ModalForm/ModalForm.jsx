import React, { useEffect, useState } from "react";
import "./ModalForm.css";
import "../../pages/Satellite/Satellite.css";
import { Modal } from "antd";
import { Formik, Form, Field } from "formik";
import axios from "axios";

const ModalForm = ({ isModalOpen, handleOk, handleCancel, itemId }) => {
    console.log(itemId);

    const [satellite, setSatellite] = useState({})
    const [polarizations, setPolarizations] = useState([])

    

    useEffect(() => {
        axios
            .get(`http://localhost:3000/api/v2/satellite/${itemId}`)
            .then((res) => {
                console.log(res.data);
                setSatellite(res.data);
            });
    }, [itemId]);

    useEffect(() => {
        axios.get(`http://localhost:3000/api/v2/polarization`)
            .then(res => {
                console.log(res.data)
                setPolarizations(res.data);
                
        })
    },[])


    return (
        <>
            <Modal
                /* title="Basic Modal" */
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Formik>
                    <Form className="form form__modal">
                        <h1 className="form__titulo">Editar satélite</h1>
                        <div className="form__group">
                            <label htmlFor="">
                                <Field
                                    type="text"
                                    className="form__group-input"
                                    placeholder="Nombre"
                                    value={satellite.satelliteName}
                                />
                            </label>
                        </div>
                        <div className="form__group">
                            <label htmlFor="">
                                <Field
                                    type="text"
                                    className="form__group-input"
                                    placeholder="Url web"
                                    value={satellite.urlImagen}
                                />
                            </label>
                        </div>
                        <div className="form__group">
                            <label htmlFor="">
                                <Field
                                    as="select"
                                    className="form__group-input"
                                    placeholder="Nombre"
                                    
                                >
                                    <option value="0">--Seleccionar--</option>
                                    {polarizations.map((polarization) => {
                                        return (
                                            <option
                                                key={polarization._id}
                                                value={polarization._id}
                                            >
                                                {polarization.typePolarization}
                                            </option>
                                        );
                                    })}
                                </Field>
                            </label>
                        </div>
                    </Form>
                </Formik>
            </Modal>
        </>
    );
};

export default ModalForm;
