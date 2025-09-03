import { Field, Formik, Form } from "formik";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Select from "react-select";
import Swal from "sweetalert2";

const ChannelForm = () => {
    const [optionsSelectChannel, setOptionSelectChannel] = useState([]);
    const [isSearchable, setIsSearchable] = useState(true);

    const [selectedValue, setSelectedValue] = useState(null); // channelId
    const [selectedId, setSelectedId] = useState(null); // channel label

    const [optionsSelectEquipo, setOptionSelectEquipo] = useState([]);
    const [selectedEquipoValue, setSelectedEquipoValue] = useState(null); // equipoId
    const [selectedIdEquipo, setSelectedIdEquipo] = useState(null); // equipo label

    // Arrays en memoria para ir acumulando NODOS y ENLACES
    const [draftNodes, setDraftNodes] = useState([]);
    const [draftEdges, setDraftEdges] = useState([]);

    // Selects dinámicos para edges
    const [edgeSourceSel, setEdgeSourceSel] = useState(null);
    const [edgeTargetSel, setEdgeTargetSel] = useState(null);

    useEffect(() => {
        api.getSignal().then((res) => {
            const opts = res.data.map((opt) => ({
                label: `${opt.nameChannel} - ${opt.tipoTecnologia}`,
                value: opt._id,
            }));
            setOptionSelectChannel(opts);
        });

        api.getEquipo().then((res) => {
            const optEquipos = res.data.map((optEquipo) => ({
                label: optEquipo.nombre.toUpperCase(),
                value: optEquipo._id,
            }));
            setOptionSelectEquipo(optEquipos);
        });
    }, []);

    const handleSelectedChannel = (e) => {
        setSelectedValue(e.value);
        setSelectedId(e.label);
    };

    const handleSelectedEquipo = (e) => {
        setSelectedEquipoValue(e.value);
        setSelectedIdEquipo(e.label);
    };

    // Opciones para los selects de Source/Target basadas en nodos agregados
    const edgeNodeOptions = useMemo(
        () =>
            draftNodes.map((n) => ({
                value: n.id,
                label: `${n.id} — ${n.data?.label || ""}`.trim(),
            })),
        [draftNodes]
    );

    // Helper: número o default
    const toNumberOr = (val, def = 0) => {
        const n = Number(val);
        return Number.isFinite(n) ? n : def;
    };

    return (
        <>
            <div className="outlet-main">
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

                <h2>Crear un diagrama</h2>

                <Formik
                    initialValues={{
                        // Campos de nodo
                        id: "",
                        label: "",
                        posX: "",
                        posY: "",
                        // Campos de enlace
                        edgeId: "",
                        source: "",
                        target: "",
                        edgeLabel: "",
                    }}
                    onSubmit={async (values, { resetForm }) => {
                        try {
                            if (!selectedValue) {
                                Swal.fire({
                                    icon: "warning",
                                    title: "Seleccione una señal",
                                    text: "Debes elegir la señal a la que pertenecerá este flujo.",
                                });
                                return;
                            }

                            if (draftNodes.length === 0) {
                                Swal.fire({
                                    icon: "warning",
                                    title: "Sin nodos",
                                    text: "Agrega al menos un nodo antes de crear el flujo.",
                                });
                                return;
                            }

                            // ===== Normalización de nodos/edges para el backend =====
                            const normalizedNodes = draftNodes.map((n) => ({
                                id: n.id,
                                type: n.type || "default",
                                // muchos backends prefieren equipo como campo directo:
                                equipo: n.data?.equipoId,           // ObjectId del equipo
                                label: n.data?.label,               // útil si tu API guarda label fuera de data
                                data: {
                                    label: n.data?.label || n.id,
                                    equipoId: n.data?.equipoId,
                                    equipoNombre: n.data?.equipoNombre,
                                },
                                position: {
                                    x: Number.isFinite(+n.position?.x) ? +n.position.x : 0,
                                    y: Number.isFinite(+n.position?.y) ? +n.position.y : 0,
                                },
                            }));

                            const normalizedEdges = draftEdges.map((e) => ({
                                id: e.id,
                                source: e.source,
                                target: e.target,
                                label: e.label,
                                type: e.type || "default",
                            }));

                            // ===== Payload con alias del id de la señal (ajusta al tuyo) =====
                            const payload = {
                                signal: selectedValue,
                                channel: selectedValue,
                                signalId: selectedValue,
                                channelId: selectedValue,
                                nodes: normalizedNodes,
                                edges: normalizedEdges,
                            };

                            console.log("POST payload channel diagram:", payload);

                            await api.createChannelDiagram(payload);

                            Swal.fire({
                                icon: "success",
                                title: "Flujo creado",
                                html: `
                  <p><strong>Señal:</strong> ${selectedId}</p>
                  <p><strong>Nodos:</strong> ${draftNodes.length}</p>
                  <p><strong>Enlaces:</strong> ${draftEdges.length}</p>
                `,
                            });

                            setDraftNodes([]);
                            setDraftEdges([]);
                            setEdgeSourceSel(null);
                            setEdgeTargetSel(null);
                            // resetForm(); // descomenta si quieres limpiar también los inputs
                        } catch (e) {
                            const data = e?.response?.data;
                            console.warn("Create flow 400 payload/error:", {
                                payload: {
                                    // imprime solo un resumen para debug
                                    signal: "…",
                                    nodesCount: draftNodes.length,
                                    edgesCount: draftEdges.length,
                                },
                                serverData: data,
                            });
                            Swal.fire({
                                icon: "error",
                                title: "Error al crear flujo",
                                html: `
                  <div style="text-align:left">
                    <div><b>Status:</b> ${e?.response?.status || "?"}</div>
                    <div><b>Mensaje:</b> ${data?.message || e.message || "Error desconocido"}</div>
                    ${data?.missing ? `<div><b>Faltan:</b> ${JSON.stringify(data.missing)}</div>` : ""}
                    ${data?.errors ? `<pre>${JSON.stringify(data.errors, null, 2)}</pre>` : ""}
                  </div>
                `,
                            });
                        }
                    }}
                >
                    {({ values, setFieldValue }) => (
                        <div className="container__form">
                            <Form className="form__add">
                                {/* Select Señal */}
                                <Select
                                    className="select-width"
                                    isSearchable={isSearchable}
                                    options={optionsSelectChannel}
                                    onChange={handleSelectedChannel}
                                    placeholder="Seleccione una señal"
                                />

                                <hr />

                                {/* ==================== NODO ==================== */}
                                <h3>Agregar Nodo</h3>
                                <div className="form__group-inputs">
                                    <Field className="form__input" placeholder="Id Nodo" name="id" />

                                    <Select
                                        className="select__input"
                                        name="equipo"
                                        placeholder="Tipo equipo"
                                        isSearchable={isSearchable}
                                        options={optionsSelectEquipo}
                                        onChange={handleSelectedEquipo}
                                    />

                                    <Field className="form__input" placeholder="Etiqueta" name="label" />

                                    <Field className="form__input" placeholder="Pos X" name="posX" />
                                    <Field className="form__input" placeholder="Pos Y" name="posY" />
                                </div>

                                <button
                                    className="button btn-danger"
                                    type="button"
                                    onClick={() => {
                                        if (!values.id?.trim()) {
                                            return Swal.fire({ icon: "warning", title: "Id Nodo requerido" });
                                        }
                                        if (!selectedEquipoValue) {
                                            return Swal.fire({ icon: "warning", title: "Seleccione un equipo/tipo" });
                                        }

                                        const node = {
                                            id: values.id.trim(),
                                            type: "default",
                                            data: {
                                                label: values.label?.trim() || values.id.trim(),
                                                equipoId: selectedEquipoValue,
                                                equipoNombre: selectedIdEquipo,
                                            },
                                            position: {
                                                x: toNumberOr(values.posX, 0),
                                                y: toNumberOr(values.posY, 0),
                                            },
                                        };

                                        if (draftNodes.some((n) => n.id === node.id)) {
                                            return Swal.fire({
                                                icon: "warning",
                                                title: "Nodo duplicado",
                                                text: `Ya existe un nodo con id "${node.id}".`,
                                            });
                                        }

                                        setDraftNodes((prev) => [...prev, node]);

                                        // limpiar inputs del bloque nodo (conserva el select de equipo)
                                        setFieldValue("id", "");
                                        setFieldValue("label", "");
                                        setFieldValue("posX", "");
                                        setFieldValue("posY", "");
                                    }}
                                >
                                    + Agregar nodo
                                </button>

                                {/* Vista previa de NODOS agregados */}
                                {draftNodes.length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        <strong>Nodos agregados:</strong>
                                        <ul style={{ marginTop: 6 }}>
                                            {draftNodes.map((n) => (
                                                <li key={n.id}>
                                                    <code>{n.id}</code> — {n.data?.label} — {n.data?.equipoNombre} — ({n.position.x},{" "}
                                                    {n.position.y})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <hr />

                                {/* ==================== ENLACE ==================== */}
                                <h3>Agregar Enlace</h3>
                                <div className="form__group-inputs">
                                    <Field className="form__input" placeholder="Id Enlace" name="edgeId" />

                                    {/* Select dinámico Source */}
                                    <Select
                                        className="select__input"
                                        placeholder="Source (Nodo)"
                                        isSearchable={isSearchable}
                                        isDisabled={edgeNodeOptions.length === 0}
                                        options={edgeNodeOptions}
                                        value={edgeSourceSel}
                                        onChange={(opt) => {
                                            setEdgeSourceSel(opt);
                                            setFieldValue("source", opt?.value || "");
                                        }}
                                        noOptionsMessage={() =>
                                            draftNodes.length === 0 ? "Agrega nodos primero" : "Sin coincidencias"
                                        }
                                    />

                                    {/* Select dinámico Target */}
                                    <Select
                                        className="select__input"
                                        placeholder="Target (Nodo)"
                                        isSearchable={isSearchable}
                                        isDisabled={edgeNodeOptions.length === 0}
                                        options={edgeNodeOptions}
                                        value={edgeTargetSel}
                                        onChange={(opt) => {
                                            setEdgeTargetSel(opt);
                                            setFieldValue("target", opt?.value || "");
                                        }}
                                        noOptionsMessage={() =>
                                            draftNodes.length === 0 ? "Agrega nodos primero" : "Sin coincidencias"
                                        }
                                    />

                                    <Field className="form__input" placeholder="Etiqueta enlace" name="edgeLabel" />
                                </div>

                                <button
                                    className="button btn-warning"
                                    type="button"
                                    onClick={() => {
                                        if (!values.edgeId?.trim()) {
                                            return Swal.fire({ icon: "warning", title: "Id Enlace requerido" });
                                        }
                                        if (!values.source?.trim() || !values.target?.trim()) {
                                            return Swal.fire({
                                                icon: "warning",
                                                title: "Source y Target requeridos",
                                                text: "Debes seleccionar los nodos a conectar.",
                                            });
                                        }
                                        if (values.source.trim() === values.target.trim()) {
                                            return Swal.fire({
                                                icon: "warning",
                                                title: "Enlace inválido",
                                                text: "Source y Target no pueden ser el mismo nodo.",
                                            });
                                        }

                                        // Chequeo extra: que existan en draftNodes
                                        const hasSource = draftNodes.some((n) => n.id === values.source.trim());
                                        const hasTarget = draftNodes.some((n) => n.id === values.target.trim());
                                        if (!hasSource || !hasTarget) {
                                            return Swal.fire({
                                                icon: "warning",
                                                title: "Nodos no encontrados",
                                                text: "Verifica que los nodos source y target ya estén agregados.",
                                            });
                                        }

                                        const edge = {
                                            id: values.edgeId.trim(),
                                            source: values.source.trim(),
                                            target: values.target.trim(),
                                            label: values.edgeLabel?.trim() || values.edgeId.trim(),
                                            type: "smoothstep",
                                        };

                                        if (draftEdges.some((e) => e.id === edge.id)) {
                                            return Swal.fire({
                                                icon: "warning",
                                                title: "Enlace duplicado",
                                                text: `Ya existe un enlace con id "${edge.id}".`,
                                            });
                                        }

                                        setDraftEdges((prev) => [...prev, edge]);

                                        // limpiar bloque de enlace
                                        setFieldValue("edgeId", "");
                                        setFieldValue("source", "");
                                        setFieldValue("target", "");
                                        setFieldValue("edgeLabel", "");
                                        setEdgeSourceSel(null);
                                        setEdgeTargetSel(null);
                                    }}
                                >
                                    + Agregar enlace
                                </button>

                                {/* Vista previa de ENLACES agregados */}
                                {draftEdges.length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        <strong>Enlaces agregados:</strong>
                                        <ul style={{ marginTop: 6 }}>
                                            {draftEdges.map((e) => (
                                                <li key={e.id}>
                                                    <code>{e.id}</code> — {e.source} → {e.target} — {e.label}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <hr />

                                <button className="button btn-primary" type="submit">
                                    Crear flujo
                                </button>
                            </Form>
                        </div>
                    )}
                </Formik>
            </div>
        </>
    );
};

export default ChannelForm;
