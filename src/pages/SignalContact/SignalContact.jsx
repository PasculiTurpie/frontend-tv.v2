import { Form, Formik, Field, ErrorMessage } from "formik";
import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../../utils/api";
import stylesSignalContact from './SignalContact.module.css';
import * as Yup from "yup";
import Swal from "sweetalert2";

const UpdateContactSignal = Yup.object().shape({
    nameChannel: Yup.object().required('Campo obligatorio'),
    contact: Yup.array().min(1, 'Selecciona al menos un contacto').required('Campo obligatorio'),
});

const SignalContact = () => {
    const [optionsSignal, setOptionsSignal] = useState([]);
    const [optionsContact, setOptionsContact] = useState([]);


    const getAllSignal = () => {
        api.getSignal().then((res) => {
            console.log(res.data)
            const optSignal = res.data.map(signal => ({
                value: signal._id,
                label: `${signal.nameChannel} ${signal.tipoTecnologia.toUpperCase() }`
            }));
            setOptionsSignal(optSignal);
        });
    };

    const getAllContact = () => {
        api.getContact().then((res) => {
            const optContact = res.data
                .filter(contact => contact.nombreContact && contact.nombreContact.trim() !== "")
                .map(contact => ({
                    value: contact._id,
                    label: contact.nombreContact
                }));
            setOptionsContact(optContact);
        });
    };

    useEffect(() => {
        getAllSignal();
        getAllContact();
    }, []);

    const handleSubmit = async (values, { resetForm }) => {
        try {
            await api.updateSignal(values.nameChannel.value, {
                contact: values.contact.map(c => c.value)
            });
            
            Swal.fire({
                icon: "success",
                title: "Asignado exitosamente",
            });
            /* resetForm(); */
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.response?.data?.message || "Error desconocido",
            });
        }
    };
    

    return (
        <div className="outlet-main">
            <Formik
                initialValues={{
                    nameChannel: null,
                    contact: null,
                }}
                validationSchema={UpdateContactSignal}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue, values, errors, touched }) => (
                    <Form className="form__add">
                        <h1 className="form__titulo">Asignar contactos</h1>

                        <div className="rows__group">
                            <div className="columns__group">
                                <div className="form__group">
                                    <label className="form__group-label">Nombre canal</label>
                                    <Select
                                        className={`form__group-input ${stylesSignalContact.select__email}`}
                                        name="nameChannel"
                                        options={optionsSignal}
                                        placeholder="Nombre canal"
                                        value={values.nameChannel}
                                        onChange={option => setFieldValue("nameChannel", option)}
                                        isSearchable
                                    />
                                    {errors.nameChannel && touched.nameChannel && (
                                        <div className="form__group-error">{errors.nameChannel}</div>
                                    )}
                                </div>
                            </div>

                            <div className="columns__group">
                                <div className="form__group">
                                    <label className="form__group-label">Contacto</label>
                                    <Select
                                        className={`form__group-input ${stylesSignalContact.select__email}`}
                                        name="contact"
                                        options={optionsContact}
                                        placeholder="Selecciona contactos"
                                        value={values.contact}
                                        onChange={(selected) => setFieldValue("contact", selected)}
                                        isMulti
                                        isSearchable
                                    />

                                    {errors.contact && touched.contact && (
                                        <div className="form__group-error">{errors.contact}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button type="submit" className={`button btn-primary`}>
                            Añadir
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default SignalContact;
