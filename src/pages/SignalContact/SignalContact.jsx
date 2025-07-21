import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../../utils/api";
import stylesSignalContact from './SignalContact.module.css'




const SignalContact = () => {
    const [optionsSignal, setOptionsSignal] = useState([]);
    const [optionsContact, setOptionsContact] = useState([]);
    const [selectedSignal, setSelectedSignal] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [idSignal, setIdSignal] = useState(null);
    const [idContact, setIdContact] = useState(null);

    const getAllSignal = () => {
        api.getSignal().then((res) => {
            const optSignal = res.data.map(signal =>({
                value: signal._id,
                label: signal.nameChannel
            }));
            console.log(optSignal)
            setOptionsSignal(optSignal)
            console.log(selectedSignal?.value)
            setIdSignal(selectedSignal?.value)
            
        });
    };

    const getAllContact = () => {
        api.getContact().then((res) => {
            const optContact = res.data.filter(contact => contact.nombreContact && contact.nombreContact.trim() !== "").map(contact =>({
                value: contact._id,
                label: contact.nombreContact
            }));
            console.log(optContact)
            setOptionsContact(optContact)
            console.log(selectedContact?.value)
            setIdContact(selectedContact?.value)
        });
    };

    const refreshList = () => {
        getAllSignal();
        getAllContact();
    };

    useEffect(() => {
        refreshList();
    }, [selectedSignal, selectedContact]);

    const updateSignal = () =>{

    }

    return (
        <>
            <div className="outlet-main">
                <Formik initialValues={{}}>
                    <Form className="form__add">
                        <h1 className="form__titulo">Asignar contacto</h1>
                        <div className="rows__group">
                            <div className="columns__group">
                                <div className="form__group">
                                    <label
                                        htmlFor="nameChannel"
                                        className="form__group-label"
                                    >
                                        Nombre canal
                                        <br />
                                        <Select
                                            className={`form__group-input ${stylesSignalContact.select__email}`}
                                            name="nameChannel"
                                            options={optionsSignal}
                                            placeholder="Nombre canal"
                                            value={selectedSignal}
                                            onChange={setSelectedSignal}
                                            isSearchable
                                        />
                                    </label>

                                    {/* {errors.nameChannel &&
                                            touched.nameChannel ? (
                                                <div className="form__group-error">
                                                    {errors.nameChannel}
                                                </div>
                                            ) : null} */}
                                </div>
                            </div>
                            <div className="columns__group">
                                <div className="form__group">
                                    <label
                                        htmlFor="contact"
                                        className="form__group-label"
                                    >
                                        Contacto
                                        <br />
                                        <Select
                                            className={`form__group-input ${stylesSignalContact.select__email}`}
                                            name="contact"
                                            options={optionsContact}
                                            placeholder="Contacto"
                                            value={selectedContact}
                                            onChange={setSelectedContact}
                                            isSearchable
                                        />
                                    </label>

                                    {/* {errors.contact &&
                                            touched.contact ? (
                                                <div className="form__group-error">
                                                    {errors.contact}
                                                </div>
                                            ) : null} */}
                                </div>
                            </div>
                        </div>
                        <button type="submit" className={`button btn-primary`}>
                            Enviar
                        </button>
                    </Form>
                </Formik>
            </div>
        </>
    );
};

export default SignalContact;
