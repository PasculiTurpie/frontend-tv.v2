/* import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import Select from "react-select";
import "./ChannelDiagram.css";
import api from "../../utils/api";

const ChannelSchema = Yup.object().shape({
    signal: Yup.object().nullable().required("La señal es obligatoria"),
});

function ChannelForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [optionsSignal, setOptionsSignal] = useState([]);
    const [tipoNombreOptions, setTipoNombreOptions] = useState([]);

    const [initialValues, setInitialValues] = useState({
        signal: null,
        nodes: [],
        edges: [],
        nodeId: "",
        nodeLabel: "",
        tipoNombre: null,
        nodeX: "",
        nodeY: "",
        edgeId: "",
        source: "",
        target: "",
        edgeLabel: "",
    });


    useEffect(() => {
        api
            .getSignal()
            .then((res) => {
                const opts = res.data.map((signal) => ({
                    value: signal._id,
                    label: signal.nameChannel
                        ? `${signal.nameChannel} ${signal.tipoTecnologia?.toUpperCase() || ""}`
                        : "Canal sin nombre",
                }));
                setOptionsSignal(opts);
            })
            .catch(() => {
                Swal.fire("Error", "No se pudieron cargar las señales", "error");
            });
    }, []);

    // Carga tipoNombreOptions con ID
    useEffect(() => {
        axios
            .get("http://localhost:3000/api/v2/equipo")
            .then((res) => {
                const opciones = res.data.map((eq) => ({
                    value: eq._id, // ID para identificar
                    label: eq.tipoNombre, // Nombre visible
                }));
                setTipoNombreOptions(opciones);
            })
            .catch(() => {
                Swal.fire("Error", "No se pudieron cargar los equipos", "error");
            });
    }, []);


    useEffect(() => {
        if (id && optionsSignal.length > 0 && tipoNombreOptions.length > 0) {
            axios
                .get(`http://localhost:3000/api/v2/channels/${id}`)
                .then(({ data }) => {
                    const selectedSignal =
                        optionsSignal.find((opt) => opt.value === data.signal?._id) || null;

                    const firstNode = data.nodes?.[0] || null;
                    const selectedTipoNombre = firstNode
                        ? tipoNombreOptions.find(
                            (opt) => opt.value === firstNode.data?.tipoNombreId
                        ) || null
                        : null;

                    setInitialValues({
                        signal: selectedSignal,
                        nodes: data.nodes || [],
                        edges: data.edges || [],
                        nodeId: "",
                        nodeLabel: "",
                        tipoNombre: selectedTipoNombre,
                        nodeX: "",
                        nodeY: "",
                        edgeId: "",
                        source: "",
                        target: "",
                        edgeLabel: "",
                    });
                })
                .catch(() => {
                    Swal.fire("Error", "No se pudo cargar el Channel", "error");
                });
        }
    }, [id, optionsSignal, tipoNombreOptions]);

    return (
        <div className="outlet-main" style={{ maxWidth: 600, margin: "auto" }}>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/channel_diagram-list">Listar</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Formulario
                    </li>
                </ol>
            </nav>
            <h2>{id ? "Editar Channel" : "Crear nuevo Channel"}</h2>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={ChannelSchema}
                onSubmit={async (values, { resetForm }) => {
                    if (values.nodes.length === 0) {
                        Swal.fire("Error", "Debes agregar al menos un nodo", "error");
                        return;
                    }
                    try {
                        const sendData = {
                            signal: values.signal.value, // enviar solo el id
                            nodes: values.nodes,
                            edges: values.edges,
                        };

                        if (id) {
                            await axios.put(
                                `http://localhost:3000/api/v2/channels/${id}`,
                                sendData
                            );
                            Swal.fire("Éxito", "Channel actualizado correctamente", "success");
                        } else {
                            const res = await axios.post(
                                "http://localhost:3000/api/v2/channels",
                                sendData
                            );
                            Swal.fire(
                                "Éxito",
                                `Channel creado con ID: ${res.data._id}`,
                                "success"
                            );
                        }
                        resetForm();
                        navigate("/channel_diagram-list");
                    } catch (err) {
                        Swal.fire(
                            "Error",
                            err.response?.data?.error || "Error al guardar el Channel",
                            "error"
                        );
                    }
                }}
            >
                {({ values, setFieldValue }) => (
                    <Form className="form__diagram">

                        <label className="form__group-label">Nombre canal</label>
                        <Select
                            className="select-width"
                            name="signal"
                            options={optionsSignal}
                            placeholder="Nombre canal"
                            value={values.signal}
                            onChange={(option) => setFieldValue("signal", option)}
                            isSearchable
                        />
                        <ErrorMessage name="signal" component="div" className="error" />

                        <hr />

                        <h3>Agregar Nodo</h3>
                        <div className="form__group-node">
                            <Field
                                className="form__group-input"
                                name="nodeId"
                                placeholder="ID Nodo"
                            />
                            <Field
                                className="form__group-input"
                                name="nodeLabel"
                                placeholder="Label"
                            />

                            <div style={{ minWidth: "200px", marginBottom: "8px" }}>
                                <label>Nombre del Equipo (tipoNombre)</label>
                                <Select
                                    name="tipoNombre"
                                    options={tipoNombreOptions}
                                    value={values.tipoNombre}
                                    onChange={(option) => setFieldValue("tipoNombre", option)}
                                    placeholder="Selecciona nombre equipo"
                                    isClearable
                                />
                            </div>

                            <Field
                                className="form__group-input"
                                name="nodeX"
                                type="number"
                                placeholder="Pos X"
                            />
                            <Field
                                className="form__group-input"
                                name="nodeY"
                                type="number"
                                placeholder="Pos Y"
                            />
                        </div>

                        <button
                            className="button btn-danger"
                            type="button"
                            onClick={() => {
                                if (
                                    !values.nodeId ||
                                    !values.nodeLabel ||
                                    !values.tipoNombre ||
                                    values.nodeX === "" ||
                                    values.nodeY === ""
                                ) {
                                    Swal.fire(
                                        "Error",
                                        "Completa todos los campos del nodo",
                                        "error"
                                    );
                                    return;
                                }
                                setFieldValue("nodes", [
                                    ...values.nodes,
                                    {
                                        id: values.nodeId,
                                        type: "customNode",
                                        position: {
                                            x: Number(values.nodeX),
                                            y: Number(values.nodeY),
                                        },
                                        data: {
                                            label: values.nodeLabel,
                                            tipoNombreId: values.tipoNombre.value, // ID
                                            tipoNombreLabel: values.tipoNombre.label, // Nombre visible
                                        },
                                    },
                                ]);
                                setFieldValue("nodeId", "");
                                setFieldValue("nodeLabel", "");
                                setFieldValue("tipoNombre", null);
                                setFieldValue("nodeX", "");
                                setFieldValue("nodeY", "");
                            }}
                        >
                            + Agregar Nodo
                        </button>

                        <ul>
                            {values.nodes.map((n) => (
                                <li key={n.id}>
                                    {n.id} - {n.data.label} ({n.data.tipoNombreLabel}) ({n.position.x},{" "}
                                    {n.position.y})
                                </li>
                            ))}
                        </ul>

                        <hr />

                        <h3>Agregar Enlace</h3>
                        <div className="form__group-node">
                            <Field
                                className="form__group-input"
                                name="edgeId"
                                placeholder="ID Edge"
                            />
                            <Field
                                className="form__group-input"
                                name="source"
                                placeholder="Source Node ID"
                            />
                            <Field
                                className="form__group-input"
                                name="target"
                                placeholder="Target Node ID"
                            />
                            <Field
                                className="form__group-input"
                                name="edgeLabel"
                                placeholder="Label (opcional)"
                            />
                        </div>

                        <button
                            className="button btn-warning"
                            type="button"
                            onClick={() => {
                                if (!values.edgeId || !values.source || !values.target) {
                                    Swal.fire(
                                        "Error",
                                        "Completa todos los campos del enlace",
                                        "error"
                                    );
                                    return;
                                }
                                setFieldValue("edges", [
                                    ...values.edges,
                                    {
                                        id: values.edgeId,
                                        source: values.source,
                                        target: values.target,
                                        label: values.edgeLabel,
                                        type: "smoothstep",
                                    },
                                ]);
                                setFieldValue("edgeId", "");
                                setFieldValue("source", "");
                                setFieldValue("target", "");
                                setFieldValue("edgeLabel", "");
                            }}
                        >
                            + Agregar Enlace
                        </button>

                        <ul>
                            {values.edges.map((e) => (
                                <li key={e.id}>
                                    {e.id}: {e.source} → {e.target}{" "}
                                    {e.label ? `(${e.label})` : ""}
                                </li>
                            ))}
                        </ul>

                        <hr />
                        <button className="button btn-primary" type="submit">
                            {id ? "Actualizar Channel" : "Crear Channel"}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default ChannelForm;
 */

import React from 'react'

const ChannelForm = () => {
  return (
    <div>ChannelForm</div>
  )
}

export default ChannelForm