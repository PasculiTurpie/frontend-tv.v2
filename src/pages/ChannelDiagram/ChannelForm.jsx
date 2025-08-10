import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import Select from "react-select";
import "./ChannelDiagram.css";
import api from "../../utils/api";

const ChannelSchema = Yup.object().shape({
    signal: Yup.string().required("La señal es obligatoria"),
    nodeId: Yup.string(),
    nodeLabel: Yup.string(),
    nodeX: Yup.number(),
    nodeY: Yup.number(),
    edgeId: Yup.string(),
    source: Yup.string(),
    target: Yup.string(),
});

function ChannelForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [optionsSignal, setOptionsSignal] = useState([]);
    const [initialValues, setInitialValues] = useState({
        signal: "",
        nodes: [],
        edges: [],
        nodeId: "",
        nodeLabel: "",
        nodeX: "",
        nodeY: "",
        edgeId: "",
        source: "",
        target: "",
        edgeLabel: "",
    });

    useEffect(() => {
        // Cargar opciones de señales
        api.getSignal().then((res) => {
            const opts = res.data.map((signal) => ({
                value: signal._id,
                label: signal.nameChannel
                    ? `${signal.nameChannel} ${
                          signal.tipoTecnologia?.toUpperCase() || ""
                      }`
                    : "Canal sin nombre",
            }));
            setOptionsSignal(opts);
        });

        // Si hay ID, cargar channel para editar
        if (id) {
            axios
                .get(`http://localhost:3000/api/v2/channels/${id}`)
                .then(({ data }) => {
                    setInitialValues({
                        signal: data.signal?._id || "",
                        nodes: data.nodes || [],
                        edges: data.edges || [],
                        nodeId: "",
                        nodeLabel: "",
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
    }, [id]);

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
                        Swal.fire(
                            "Error",
                            "Debes agregar al menos un nodo",
                            "error"
                        );
                        return;
                    }
                    try {
                        if (id) {
                            await axios.put(
                                `http://localhost:3000/api/v2/channels/${id}`,
                                {
                                    signal: values.signal,
                                    nodes: values.nodes,
                                    edges: values.edges,
                                }
                            );
                            Swal.fire(
                                "Éxito",
                                "Channel actualizado correctamente",
                                "success"
                            );
                        } else {
                            const res = await axios.post(
                                "http://localhost:3000/api/v2/channels",
                                {
                                    signal: values.signal,
                                    nodes: values.nodes,
                                    edges: values.edges,
                                }
                            );
                            Swal.fire(
                                "Éxito",
                                `Channel creado con ID: ${res.data._id}`,
                                "success"
                            );
                        }
                        resetForm();
                        navigate("/channels");
                    } catch (err) {
                        Swal.fire(
                            "Error",
                            err.response?.data?.error ||
                                "Error al guardar el Channel",
                            "error"
                        );
                    }
                }}
            >
                {({ values, setFieldValue }) => (
                    <Form className="form__diagram">
                        {/* Signal */}
                        <label className="form__group-label">
                            Nombre canal
                        </label>
                        <Select
                            className="select-width"
                            name="signal"
                            options={optionsSignal}
                            placeholder="Nombre canal"
                            value={
                                optionsSignal.find(
                                    (opt) => opt.value === values.signal
                                ) || null
                            }
                            onChange={(option) =>
                                setFieldValue("signal", option.value)
                            }
                            isSearchable
                        />
                        <ErrorMessage
                            name="signal"
                            component="div"
                            className="error"
                        />

                        <hr />
                        {/* Nodos */}
                        <h3>Agregar Nodo</h3>
                        <div className="form__group-node">
                            <div>
                                <Field
                                    className="form__group-input"
                                    name="nodeId"
                                    placeholder="ID Nodo"
                                />
                                <ErrorMessage
                                    name="nodeId"
                                    component="div"
                                    className="error"
                                />
                            </div>
                            <div>
                                <Field
                                    className="form__group-input"
                                    name="nodeLabel"
                                    placeholder="Label"
                                />
                                <ErrorMessage
                                    name="nodeLabel"
                                    component="div"
                                    className="error"
                                />
                            </div>
                            <div>
                                <Field
                                    className="form__group-input"
                                    name="nodeX"
                                    type="number"
                                    placeholder="Pos X"
                                />
                                <ErrorMessage
                                    name="nodeX"
                                    component="div"
                                    className="error"
                                />
                            </div>
                            <div>
                                <Field
                                    className="form__group-input"
                                    name="nodeY"
                                    type="number"
                                    placeholder="Pos Y"
                                />
                                <ErrorMessage
                                    name="nodeY"
                                    component="div"
                                    className="error"
                                />
                            </div>
                        </div>

                        <button
                            className="button btn-danger"
                            type="button"
                            onClick={() => {
                                if (
                                    !values.nodeId ||
                                    !values.nodeLabel ||
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
                                        type: "default",
                                        position: {
                                            x: Number(values.nodeX),
                                            y: Number(values.nodeY),
                                        },
                                        data: { label: values.nodeLabel },
                                    },
                                ]);
                                setFieldValue("nodeId", "");
                                setFieldValue("nodeLabel", "");
                                setFieldValue("nodeX", "");
                                setFieldValue("nodeY", "");
                            }}
                        >
                            + Agregar Nodo
                        </button>

                        <ul>
                            {values.nodes.map((n) => (
                                <li key={n.id}>
                                    {n.id} - {n.data.label} ({n.position.x},{" "}
                                    {n.position.y})
                                </li>
                            ))}
                        </ul>

                        <hr />
                        {/* Edges */}
                        <h3>Agregar Enlace</h3>
                        <div className="form__group-node">
                            <div>
                                <Field
                                    className="form__group-input"
                                    name="edgeId"
                                    placeholder="ID Edge"
                                />
                                <ErrorMessage
                                    name="edgeId"
                                    component="div"
                                    className="error"
                                />
                            </div>
                            <div>
                                <Field
                                    className="form__group-input"
                                    name="source"
                                    placeholder="Source Node ID"
                                />
                                <ErrorMessage
                                    name="source"
                                    component="div"
                                    className="error"
                                />
                            </div>
                            <div>
                                <Field
                                    className="form__group-input"
                                    name="target"
                                    placeholder="Target Node ID"
                                />
                                <ErrorMessage
                                    name="target"
                                    component="div"
                                    className="error"
                                />
                            </div>
                            <div>
                                <Field
                                    className="form__group-input"
                                    name="edgeLabel"
                                    placeholder="Label (opcional)"
                                />
                            </div>
                        </div>

                        <button
                            className="button btn-warning"
                            type="button"
                            onClick={() => {
                                if (
                                    !values.edgeId ||
                                    !values.source ||
                                    !values.target
                                ) {
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
                                        type: "default",
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
