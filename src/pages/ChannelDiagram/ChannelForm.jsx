// ChannelForm.jsx
import { Field, Formik, Form } from "formik";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Select from "react-select";
import Swal from "sweetalert2";

// Fallback numérico para MarkerType.ArrowClosed (React Flow = 1)
const ARROW_CLOSED = { type: 1 };

// Tolerancia para considerar "misma X" (alineación vertical)
const SAME_X_EPS = 8;

/** Devuelve handles según geometría (vertical) y dirección ('ida'|'vuelta').
 *  - Si están alineados en X: usa TOP/BOTTOM dobles para separar ida/vuelta
 *  - Caso contrario: usa RIGHT/LEFT (ida) y LEFT/RIGHT (vuelta)
 */
function pickHandlesByGeometry(srcNode, tgtNode, direction /* 'ida' | 'vuelta' */) {
    const sx = Number(srcNode?.position?.x ?? 0);
    const sy = Number(srcNode?.position?.y ?? 0);
    const tx = Number(tgtNode?.position?.x ?? 0);
    const ty = Number(tgtNode?.position?.y ?? 0);

    const sameX = Math.abs(sx - tx) <= SAME_X_EPS;

    // Caso vertical (misma X, distinta Y)
    if (sameX && sy !== ty) {
        const srcIsUpper = sy < ty; // source por encima del target

        if (direction === "ida") {
            // Ida usa pista 1
            if (srcIsUpper) {
                // source arriba: bottom-1 -> top-1
                return { sourceHandle: "out-bottom-1", targetHandle: "in-top-1" };
            } else {
                // source abajo: top-1 -> bottom-1
                return { sourceHandle: "out-top-1", targetHandle: "in-bottom-1" };
            }
        } else {
            // Vuelta usa pista 2
            if (srcIsUpper) {
                return { sourceHandle: "out-bottom-2", targetHandle: "in-top-2" };
            } else {
                return { sourceHandle: "out-top-2", targetHandle: "in-bottom-2" };
            }
        }
    }

    // No vertical: lados para no cruzar (ida y vuelta separadas)
    if (direction === "ida") {
        return { sourceHandle: "out-right", targetHandle: "in-left" };
    } else {
        return { sourceHandle: "out-left", targetHandle: "in-right" };
    }
}

// Helper: número o default
const toNumberOr = (val, def = 0) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : def;
};

const ChannelForm = () => {
    const [optionsSelectChannel, setOptionSelectChannel] = useState([]);
    const [isSearchable] = useState(true);

    const [selectedValue, setSelectedValue] = useState(null); // id señal
    const [selectedId, setSelectedId] = useState(null); // label señal

    const [optionsSelectEquipo, setOptionSelectEquipo] = useState([]);
    const [selectedEquipoValue, setSelectedEquipoValue] = useState(null); // id equipo
    const [selectedIdEquipo, setSelectedIdEquipo] = useState(null); // label equipo

    // Acumuladores en memoria
    const [draftNodes, setDraftNodes] = useState([]);
    const [draftEdges, setDraftEdges] = useState([]);

    // Selects dinámicos para edges
    const [edgeSourceSel, setEdgeSourceSel] = useState(null);
    const [edgeTargetSel, setEdgeTargetSel] = useState(null);

    // Dirección del enlace
    const edgeDirOptions = [
        { value: "ida", label: "Ida (source → target)" },
        { value: "vuelta", label: "Vuelta (target ← source)" },
    ];
    const [edgeDirection, setEdgeDirection] = useState(edgeDirOptions[0]);

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
                label: optEquipo.nombre?.toUpperCase?.() || optEquipo.nombre,
                value: optEquipo._id,
            }));
            setOptionSelectEquipo(optEquipos);
            // (Opción id-únicamente) -> NO usamos equiposMap aquí.
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

    // Opciones para selects Source/Target basadas en nodos agregados
    const edgeNodeOptions = useMemo(
        () =>
            draftNodes.map((n) => ({
                value: n.id,
                label: `${n.id} — ${n.data?.label || ""}`.trim(),
            })),
        [draftNodes]
    );

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
                    onSubmit={async () => {
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

                            // Normaliza NODOS (usa CustomNode en el canvas: type 'custom')
                            const normalizedNodes = draftNodes.map((n) => ({
                                id: n.id,
                                type: n.type || "custom",
                                equipo: n.data?.equipoId, // si tu backend lo espera a nivel raíz
                                label: n.data?.label,
                                data: {
                                    label: n.data?.label || n.id,
                                    equipoId: n.data?.equipoId,       // ← solo id (opción id-únicamente)
                                    equipoNombre: n.data?.equipoNombre,
                                    tooltip: n.data?.tooltip,
                                },
                                position: {
                                    x: Number.isFinite(+n.position?.x) ? +n.position.x : 0,
                                    y: Number.isFinite(+n.position?.y) ? +n.position.y : 0,
                                },
                            }));

                            // Normaliza EDGES (usa CustomDirectionalEdge en el canvas: type 'directional')
                            const normalizedEdges = draftEdges.map((e) => ({
                                id: e.id,
                                source: e.source,
                                target: e.target,
                                sourceHandle: e.sourceHandle,
                                targetHandle: e.targetHandle,
                                label: e.label,
                                type: e.type || "directional",
                                style: e.style,
                                markerEnd: e.markerEnd,
                                markerStart: e.markerStart,
                                data: { ...(e.data || {}) },
                            }));

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
                            setEdgeDirection(edgeDirOptions[0]);
                        } catch (e) {
                            const data = e?.response?.data;
                            console.warn("Create flow error:", {
                                serverStatus: e?.response?.status,
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
                                            type: "custom", // se renderiza con CustomNode
                                            data: {
                                                label: values.label?.trim() || values.id.trim(),
                                                equipoId: selectedEquipoValue,   // ← SOLO id
                                                equipoNombre: selectedIdEquipo,  // opcional para vista previa
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

                                    {/* Dirección del enlace (color, flecha y handles) */}
                                    <Select
                                        className="select__input"
                                        options={edgeDirOptions}
                                        value={edgeDirection}
                                        onChange={(opt) => setEdgeDirection(opt)}
                                        placeholder="Dirección"
                                    />

                                    <Field
                                        className="form__input form__input-special"
                                        placeholder="Etiqueta enlace"
                                        name="edgeLabel"
                                    />
                                </div>

                                <button
                                    className="button btn-warning"
                                    type="button"
                                    onClick={() => {
                                        const id = values.edgeId?.trim();
                                        const src = values.source?.trim();
                                        const tgt = values.target?.trim();

                                        if (!id) return Swal.fire({ icon: "warning", title: "Id Enlace requerido" });
                                        if (!src || !tgt) {
                                            return Swal.fire({
                                                icon: "warning",
                                                title: "Source y Target requeridos",
                                                text: "Debes seleccionar los nodos a conectar.",
                                            });
                                        }
                                        if (src === tgt) {
                                            return Swal.fire({
                                                icon: "warning",
                                                title: "Enlace inválido",
                                                text: "Source y Target no pueden ser el mismo nodo.",
                                            });
                                        }

                                        // Verifica que existan
                                        const srcNode = draftNodes.find((n) => n.id === src);
                                        const tgtNode = draftNodes.find((n) => n.id === tgt);
                                        if (!srcNode || !tgtNode) {
                                            return Swal.fire({
                                                icon: "warning",
                                                title: "Nodos no encontrados",
                                                text: "Verifica que los nodos source y target ya estén agregados.",
                                            });
                                        }

                                        // Color + handles según dirección y geometría
                                        const dir = edgeDirection.value; // 'ida' | 'vuelta'
                                        const color = dir === "vuelta" ? "green" : "red";
                                        const handleByDir = pickHandlesByGeometry(srcNode, tgtNode, dir);

                                        const edge = {
                                            id,
                                            source: src,
                                            target: tgt,
                                            sourceHandle: handleByDir.sourceHandle,
                                            targetHandle: handleByDir.targetHandle,
                                            label: values.edgeLabel?.trim() || id,
                                            type: "directional", // lo renderiza CustomDirectionalEdge (smoothstep)
                                            style: { stroke: color, strokeWidth: 2 },
                                            markerEnd: { ...ARROW_CLOSED }, // flecha al final
                                            data: {
                                                direction: dir,
                                                label: values.edgeLabel?.trim() || id,
                                            },
                                        };

                                        // Evitar duplicado por id
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
                                        setEdgeDirection(edgeDirOptions[0]);
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
                                                    <code>{e.id}</code> — {e.source} ({e.sourceHandle}) → {e.target} ({e.targetHandle}) — {e.label} —{" "}
                                                    <span style={{ color: e.style?.stroke }}>{e.data?.direction}</span>
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
