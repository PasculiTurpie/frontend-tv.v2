import { Form } from "antd";
import { Field, Formik } from "formik";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Select from "react-select";

const ChannelForm = () => {
    const [optionsSelectChannel, setOptionSelectChannel] = useState([]);
    const [isSearchable, setIsSearchable] = useState(true);
    const [selectedValue, setSelectedValue] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [optionsSelectIrd, setOptionSelectIrd] = useState([]);
    const [selectedIrdValue, setSelectedIrdValue] = useState(null);
    const [selectedIdIrd, setSelectedIdIrd] = useState(null);
    const [optionsSelectEquipo, setOptionSelectEquipo] = useState([]);
    const [selectedEquipoValue, setSelectedEquipoValue] = useState(null);
    const [selectedIdEquipo, setSelectedIdEquipo] = useState(null);

    useEffect(() => {
        api.getSignal().then((res) => {
            console.log(res.data);
            const opts = res.data.map((opt) => ({
                label: `${opt.nameChannel} - ${opt.tipoTecnologia}`,
                value: opt._id,
            }));
            setOptionSelectChannel(opts);
        });
        api.getEquipo().then((res) => {
            console.log(res.data);
            const optEquipos = res.data.map((optEquipo) => ({
                label: optEquipo.nombre.toUpperCase(),
                value: optEquipo._id,
            }));
            setOptionSelectEquipo(optEquipos);
        });
        api.getIrd().then((res) => {
            console.log(res.data)
            const optionIrds = res.data.map((optIrd) => ({
                label: optIrd.ipAdminIrd,
                value: optIrd._id,
            }));
            setOptionSelectIrd(optionIrds)
        })
    }, []);

    const handleSelectedChannel = (e) => {
        console.log(e.label);
        console.log(e.value);
        setSelectedValue(e.value);
        setSelectedId(e.label);
    };

    const handleSelectedEquipo = (e) => {
        console.log(e.label);
        console.log(e.value);
        setSelectedEquipoValue(e.value);
        setSelectedIdEquipo(e.label);
    };

    const handleSelectedIrd = (e) => {
        console.log(e.label);
        console.log(e.value);
        setSelectedIrdValue(e.value);
        setSelectedIdIrd(e.label);
    };

    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/channel_diagram-list">Listar</Link>
                        </li>
                        <li
                            className="breadcrumb-item active"
                            aria-current="page"
                        >
                            Formulario
                        </li>
                    </ol>
                </nav>
                <h2>Crear un diagrama</h2>
                <Formik>
                    <div className="container__form">
                        <Form className="form__add">
                            <Select
                                className="select-width"
                                isSearchable={isSearchable}
                                options={optionsSelectChannel}
                                onChange={handleSelectedChannel}
                                defaultValue={{
                                    label: "Seleccione a una señal",
                                    value: "0",
                                }}
                            />
                            <hr />
                            <h3>Agregar Nodo</h3>
                            <div className="form__group-inputs">
                                <Field
                                    className="form__input"
                                    placeholder="Id Nodo"
                                    name="id"
                                />
                                <Select
                                    className="select__input"
                                    name="ird"
                                    placeholder="Seleccione Ird"
                                    isSearchable={isSearchable}
                                    options={optionsSelectIrd}
                                    onChange={handleSelectedIrd}
                                    defaultValue={{
                                        label: "Seleccione Ird",
                                        value: "0",
                                    }}
                                />
                                <Select
                                    className="select__input"
                                    name="equipo"
                                    placeholder="Tipo equipo"
                                    isSearchable={isSearchable}
                                    options={optionsSelectEquipo}
                                    onChange={handleSelectedEquipo}
                                    defaultValue={{
                                        label: "Seleccione a un equipo",
                                        value: "0",
                                    }}
                                />
                                <Field
                                    className="form__input"
                                    placeholder="Etiqueta"
                                    name="label"
                                />
                                
                                <Field
                                    className="form__input"
                                    placeholder="Pos X"
                                />
                                <Field
                                    className="form__input"
                                    placeholder="Pos Y"
                                />
                            </div>
                            <button className="button btn-danger">
                                + Agregar nodo
                            </button>
                            <hr />
                            <h3>Agregar Enlace</h3>
                            <div className="form__group-inputs">
                                <Field
                                    className="form__input"
                                    placeholder="Id Nodo"
                                />
                                <Select
                                    className="select__input"
                                    placeholder="Tipo equipo"
                                />
                                <Field
                                    className="form__input"
                                    placeholder="Etiqueta"
                                />
                                <Field
                                    className="form__input"
                                    placeholder="Pos X"
                                />
                                <Field
                                    className="form__input"
                                    placeholder="Pos Y"
                                />
                            </div>
                            <button className="button btn-warning">
                                + Agregar enlace
                            </button>
                            <hr />
                            <button className="button btn-primary">
                                Crear flujo
                            </button>
                        </Form>
                    </div>
                </Formik>
            </div>
        </>
    );
};

export default ChannelForm;
