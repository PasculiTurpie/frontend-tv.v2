// src/pages/ChannelDiagram/ChannelForm.jsx
import { Field, Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import Select from "react-select";
import Swal from "sweetalert2";
import "./ChannelForm.css";

// Fallback numérico para MarkerType.ArrowClosed (React Flow = 1)
const ARROW_CLOSED = { type: 1 };
const SAME_X_EPS = 8;

// ---- react-select estilos consistentes (altura 38px, ancho 100%) ----
const selectStyles = {
  container: (base) => ({ ...base, width: "100%" }),
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    height: 38,
    borderRadius: 8,
    borderColor: state.isFocused ? "#375d9d" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(55, 93, 157, 0.20)" : "none",
    "&:hover": { borderColor: state.isFocused ? "#375d9d" : "#cbd5e1" },
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
  indicatorsContainer: (base) => ({ ...base, height: 38 }),
  dropdownIndicator: (base) => ({ ...base, padding: "6px 8px" }),
  clearIndicator: (base) => ({ ...base, padding: "6px 8px" }),
  menu: (base) => ({ ...base, zIndex: 20 }),
};

// Helpers
const toNumberOr = (val, def = 0) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : def;
};
const tipoToKey = (tipoNombre) => {
  const raw =
    (typeof tipoNombre === "object" && tipoNombre?.tipoNombre) ||
    (typeof tipoNombre === "string" && tipoNombre) ||
    "";
  const key = String(raw).trim().toLowerCase();
  if (["satélite", "satelite"].includes(key)) return "satelite";
  if (["switch", "switches", "sw"].includes(key)) return "switch";
  if (["router", "routers", "rt", "rtr"].includes(key)) return "router";
  return key;
};
const toId = (v) => {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && v._id) return String(v._id);
  return null;
};

/**
 * Elige handles por geometría y dirección ('ida' | 'vuelta').
 * Regla adicional: si el SOURCE es un SATÉLITE, fuerza out-right -> in-left.
 */
function pickHandlesByGeometry(srcNode, tgtNode, direction /* 'ida' | 'vuelta' */) {
  const srcTipo =
    srcNode?.data?.equipoTipo ||
    tipoToKey(srcNode?.data?.equipo?.tipoNombre?.tipoNombre);
  if (srcTipo === "satelite") {
    return { sourceHandle: "out-right", targetHandle: "in-left" };
  }

  const sx = Number(srcNode?.position?.x ?? 0);
  const sy = Number(srcNode?.position?.y ?? 0);
  const tx = Number(tgtNode?.position?.x ?? 0);
  const ty = Number(tgtNode?.position?.y ?? 0);

  const sameX = Math.abs(sx - tx) <= SAME_X_EPS;

  if (sameX && sy !== ty) {
    const srcIsUpper = sy < ty;
    if (direction === "ida") {
      return srcIsUpper
        ? { sourceHandle: "out-bottom-1", targetHandle: "in-top-1" }
        : { sourceHandle: "out-top-1", targetHandle: "in-bottom-1" };
    } else {
      return srcIsUpper
        ? { sourceHandle: "out-bottom-2", targetHandle: "in-top-2" }
        : { sourceHandle: "out-top-2", targetHandle: "in-bottom-2" };
    }
  }

  return direction === "ida"
    ? { sourceHandle: "out-right", targetHandle: "in-left" }
    : { sourceHandle: "out-left", targetHandle: "in-right" };
}

/* =========================
   Yup Validation Schemas
========================= */

// RegEx simple para IPv4 multicast: 224.0.0.0 – 239.255.255.255
// (no validamos máscara/puerto; es un "formato razonable" opcional)
const multicastRegex =
  /^(22[4-9]|23[0-9])(?:\.(?:25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;

// Validaciones del formulario (para inputs de NODO y ENLACE).
// Ojo: el selector de Señal se valida en el submit (no es un Field de Formik).
const validationSchema = Yup.object({
  // Nodo
  id: Yup.string()
    .trim()
    .max(64, "Máximo 64 caracteres")
    .matches(/^[\w.-]+$/, "Sólo letras, números, guión y punto")
    .when("$nodeAction", (nodeAction, schema) =>
      nodeAction === "add" ? schema.required("Id del nodo es requerido") : schema.notRequired()
    ),
  label: Yup.string()
    .trim()
    .max(120, "Máximo 120 caracteres")
    .nullable(),
  posX: Yup.number()
    .typeError("Pos X debe ser numérico")
    .min(-100000, "Muy pequeño")
    .max(100000, "Muy grande")
    .nullable(),
  posY: Yup.number()
    .typeError("Pos Y debe ser numérico")
    .min(-100000, "Muy pequeño")
    .max(100000, "Muy grande")
    .nullable(),

  // Enlace
  edgeId: Yup.string()
    .trim()
    .max(128, "Máximo 128 caracteres")
    .matches(/^[\w.:->]+$/, "Use letras, números y separadores (:, ->, .)")
    .when("$edgeAction", (edgeAction, schema) =>
      edgeAction === "add" ? schema.required("Id del enlace es requerido") : schema.notRequired()
    ),
  source: Yup.string().when("$edgeAction", (edgeAction, schema) =>
    edgeAction === "add" ? schema.required("Source es requerido") : schema.notRequired()
  ),
  target: Yup.string().when("$edgeAction", (edgeAction, schema) =>
    edgeAction === "add" ? schema.required("Target es requerido") : schema.notRequired()
  ),
  edgeLabel: Yup.string().trim().max(200, "Máximo 200 caracteres").nullable(),
  edgeMulticast: Yup.string()
    .trim()
    .matches(multicastRegex, "Multicast inválido (ej: 239.2.3.222)")
    .nullable()
    .notRequired(),
});

const ChannelForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Señales
  const [optionsSelectChannel, setOptionSelectChannel] = useState([]);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [signalsError, setSignalsError] = useState(null);

  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // Equipos agrupados
  const [optionsSelectEquipo, setOptionSelectEquipo] = useState([]);
  const [selectedEquipoValue, setSelectedEquipoValue] = useState(null);
  const [selectedIdEquipo, setSelectedIdEquipo] = useState(null);
  const [selectedEquipoTipo, setSelectedEquipoTipo] = useState(null);

  // Borradores
  const [draftNodes, setDraftNodes] = useState([]);
  const [draftEdges, setDraftEdges] = useState([]);

  // Selects dinámicos de edges
  const [edgeSourceSel, setEdgeSourceSel] = useState(null);
  const [edgeTargetSel, setEdgeTargetSel] = useState(null);

  // Dirección
  const edgeDirOptions = [
    { value: "ida", label: "Ida (source → target)" },
    { value: "vuelta", label: "Vuelta (target ← source)" },
  ];
  const [edgeDirection, setEdgeDirection] = useState(edgeDirOptions[0]);

  // Cargar señales y filtrar disponibles
  useEffect(() => {
    let mounted = true;
    (async () => {
      setSignalsLoading(true);
      setSignalsError(null);
      try {
        const [signalsRes, channelsRes] = await Promise.all([
          api.getSignal(), // /signal
          api.getChannelDiagram(), // /channels
        ]);

        const signals = Array.isArray(signalsRes?.data) ? signalsRes.data : [];
        const channels = Array.isArray(channelsRes?.data) ? channelsRes.data : [];

        const usedSet = new Set(channels.map((ch) => toId(ch?.signal)).filter(Boolean));

        const unusedSignals = signals.filter((s) => !usedSet.has(toId(s?._id)));

        const opts = unusedSignals.map((opt) => ({
          label: `${opt.nameChannel ?? opt.nombre ?? "Sin nombre"} - ${opt.tipoTecnologia ?? opt.tipo ?? ""}`.trim(),
          value: opt._id,
          raw: opt,
        }));

        if (!mounted) return;
        setOptionSelectChannel(opts);

        const preId = searchParams.get("signalId");
        if (preId && opts.some((o) => String(o.value) === String(preId))) {
          const found = opts.find((o) => String(o.value) === String(preId));
          setSelectedValue(found.value);
          setSelectedId(found.label);
        } else {
          setSelectedValue(null);
          setSelectedId(null);
        }
      } catch (e) {
        if (!mounted) return;
        setSignalsError(e);
      } finally {
        if (mounted) setSignalsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  // Cargar equipos
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.getEquipo();
        const arr = res.data || [];

        const satelites = [];
        const irds = [];
        const switches = [];
        const routers = [];
        const otros = [];

        for (const eq of arr) {
          const key = tipoToKey(eq?.tipoNombre);
          const baseName = (eq?.nombre?.toUpperCase?.() || eq?.nombre || "").trim();
          const pol =
            eq?.satelliteRef?.satelliteType?.typePolarization
              ? String(eq.satelliteRef.satelliteType.typePolarization).trim()
              : null;

          const option = {
            label: key === "satelite" && pol ? `${baseName} ${pol}` : baseName,
            value: eq?._id,
            meta: { tipo: key },
          };

          if (key === "satelite") satelites.push(option);
          else if (key === "ird") irds.push(option);
          else if (key === "switch") switches.push(option);
          else if (key === "router") routers.push(option);
          else otros.push(option);
        }

        const byLabel = (a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" });
        satelites.sort(byLabel); irds.sort(byLabel); switches.sort(byLabel); routers.sort(byLabel); otros.sort(byLabel);

        const grouped = [
          { label: "Satélites", options: satelites },
          { label: "IRD", options: irds },
          { label: "Switches", options: switches },
          { label: "Routers", options: routers },
          { label: "Otros equipos", options: otros },
        ].filter((g) => g.options.length > 0);

        if (mounted) setOptionSelectEquipo(grouped);
      } catch (e) {
        console.warn("Error cargando equipos:", e?.message);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectedChannel = (e) => {
    setSelectedValue(e?.value || null);
    setSelectedId(e?.label || null);
  };
  const handleSelectedEquipo = (e) => {
    setSelectedEquipoValue(e?.value || null);
    setSelectedIdEquipo(e?.label || null);
    setSelectedEquipoTipo(e?.meta?.tipo || null);
  };

  const edgeNodeOptions = useMemo(
    () =>
      draftNodes.map((n) => ({
        value: n.id,
        label: `${n.id} — ${n.data?.label || ""}`.trim(),
      })),
    [draftNodes]
  );

  const availableSignals = optionsSelectChannel.length;

  return (
    <div className="chf__wrapper">
      <nav aria-label="breadcrumb" className="chf__breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/channel_diagram-list">Listar</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Formulario
          </li>
        </ol>
      </nav>

      <h2 className="chf__title">Crear un diagrama</h2>

      <Formik
        initialValues={{
          // Nodo
          id: "",
          label: "",
          posX: "",
          posY: "",
          // Enlace
          edgeId: "",
          source: "",
          target: "",
          edgeLabel: "",
          edgeMulticast: "",
        }}
        // Pasamos "context" a Yup para saber en qué bloque se validará
        validationSchema={validationSchema}
        validateOnBlur
        validateOnChange={false}
        onSubmit={async (_, { resetForm }) => {
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

            const normalizedNodes = draftNodes.map((n) => ({
              id: n.id,
              type: n.type || "custom",
              equipo: n.data?.equipoId,
              label: n.data?.label,
              data: {
                label: n.data?.label || n.id,
                equipoId: n.data?.equipoId,
                equipoNombre: n.data?.equipoNombre,
                equipoTipo: n.data?.equipoTipo,
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
            resetForm();
          } catch (e) {
            const data = e?.response?.data;
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
        {({ values, setFieldValue, validateForm, setErrors, setTouched }) => (
          <Form className="chf__form">
            {/* ---- Señal ---- */}
            <fieldset className="chf__fieldset">
              <legend className="chf__legend">Señal</legend>

              {signalsLoading ? (
                <Select className="select-width" isLoading isDisabled placeholder="Cargando señales…" styles={selectStyles} />
              ) : signalsError ? (
                <div className="chf__alert chf__alert--error">
                  <strong>Error al cargar señales.</strong>
                  <div className="chf__alert-actions">
                    <button type="button" className="chf__btn" onClick={() => window.location.reload()}>
                      Reintentar
                    </button>
                  </div>
                </div>
              ) : optionsSelectChannel.length === 0 ? (
                <div className="chf__empty">
                  <h4>No hay señales disponibles</h4>
                  <p>Todas las señales ya están vinculadas a un diagrama. Crea una nueva señal para continuar.</p>
                  <button
                    type="button"
                    className="chf__btn chf__btn--primary"
                    onClick={() => navigate("/signals/new")}
                  >
                    + Crear nueva señal
                  </button>
                </div>
              ) : (
                <>
                  <div className="chf__row">
                    <div className="chf__select-inline">
                      <Select
                        className="select-width"
                        isSearchable
                        options={optionsSelectChannel}
                        onChange={handleSelectedChannel}
                        placeholder="Seleccione una señal"
                        noOptionsMessage={() => "No hay señales disponibles"}
                        styles={selectStyles}
                      />
                    </div>
                    <div className="chf__available">
                      <span className="chf__badge chf__badge--primary">
                        {optionsSelectChannel.length} disponibles
                      </span>
                    </div>
                  </div>
                  {!selectedValue && (
                    <div className="chf__error">Debes seleccionar una señal antes de crear el flujo.</div>
                  )}
                </>
              )}
            </fieldset>

            {/* ---- Nodo ---- */}
            <fieldset className="chf__fieldset">
              <legend className="chf__legend">Agregar nodo</legend>

              <div className="chf__grid chf__grid--3 chf__grid--align-end">
                <label className="chf__label">
                  Id Nodo
                  <Field className="chf__input" placeholder="Id Nodo" name="id" />
                  <ErrorMessage name="id" component="div" className="chf__error" />
                </label>

                <label className="chf__label">
                  Equipo
                  <Select
                    className="chf__select"
                    name="equipo"
                    placeholder="Equipos"
                    options={optionsSelectEquipo}
                    onChange={handleSelectedEquipo}
                    styles={selectStyles}
                  />
                  {!selectedEquipoValue && (
                    <div className="chf__error">Seleccione un equipo/tipo.</div>
                  )}
                </label>

                <label className="chf__label">
                  Etiqueta
                  <Field className="chf__input" placeholder="Etiqueta visible" name="label" />
                  <ErrorMessage name="label" component="div" className="chf__error" />
                </label>

                <label className="chf__label">
                  Pos X
                  <Field className="chf__input" placeholder="Pos X" name="posX" />
                  <ErrorMessage name="posX" component="div" className="chf__error" />
                </label>

                <label className="chf__label">
                  Pos Y
                  <Field className="chf__input" placeholder="Pos Y" name="posY" />
                  <ErrorMessage name="posY" component="div" className="chf__error" />
                </label>

                <button
                  className="chf__btn chf__btn--secondary"
                  type="button"
                  onClick={async () => {
                    // Validamos SÓLO el bloque de nodo con contexto
                    const errors = await validationSchema.validate(values, {
                      abortEarly: false,
                      context: { nodeAction: "add" },
                    }).then(() => ({})).catch((yerr) => {
                      const errMap = {};
                      if (yerr?.inner?.length) {
                        yerr.inner.forEach((e) => { errMap[e.path] = e.message; });
                      } else if (yerr?.path) {
                        errMap[yerr.path] = yerr.message;
                      }
                      return errMap;
                    });

                    // Equipo es un select externo a Yup (porque no es Field)
                    if (!selectedEquipoValue) {
                      errors.equipo = "Seleccione un equipo/tipo.";
                    }

                    if (Object.keys(errors).length) {
                      setErrors(errors);
                      setTouched({
                        id: true,
                        label: true,
                        posX: true,
                        posY: true,
                      });
                      return;
                    }

                    const node = {
                      id: values.id.trim(),
                      type: "custom",
                      data: {
                        label: values.label?.trim() || values.id.trim(),
                        equipoId: selectedEquipoValue,
                        equipoNombre: selectedIdEquipo,
                        equipoTipo: selectedEquipoTipo,
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
                    setFieldValue("id", "");
                    setFieldValue("label", "");
                    setFieldValue("posX", "");
                    setFieldValue("posY", "");
                  }}
                >
                  + Agregar nodo
                </button>
              </div>

              {draftNodes.length > 0 && (
                <ul className="chf__list">
                  {draftNodes.map((n) => (
                    <li key={n.id} className="chf__list-item">
                      <code>{n.id}</code> — {n.data?.label} — {n.data?.equipoNombre}{" "}
                      <span className="chf__badge">{n.data?.equipoTipo || "-"}</span>{" "}
                      <span className="chf__muted">({n.position.x}, {n.position.y})</span>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>

            {/* ---- Enlace ---- */}
            <fieldset className="chf__fieldset">
              <legend className="chf__legend">Agregar enlace</legend>

              <div className="chf__grid chf__grid--4 chf__grid--align-end chf__row-gap">
                <label className="chf__label">
                  Id Enlace
                  <Field className="chf__input" placeholder="Id Enlace" name="edgeId" />
                  <ErrorMessage name="edgeId" component="div" className="chf__error" />
                </label>

                <label className="chf__label">
                  Source (Nodo)
                  <Select
                    className="chf__select"
                    placeholder="Source"
                    isDisabled={edgeNodeOptions.length === 0}
                    options={edgeNodeOptions}
                    value={edgeSourceSel}
                    onChange={(opt) => {
                      setEdgeSourceSel(opt);
                      setFieldValue("source", opt?.value || "");
                    }}
                    styles={selectStyles}
                    noOptionsMessage={() =>
                      draftNodes.length === 0 ? "Agrega nodos primero" : "Sin coincidencias"
                    }
                  />
                  <ErrorMessage name="source" component="div" className="chf__error" />
                </label>

                <label className="chf__label">
                  Target (Nodo)
                  <Select
                    className="chf__select"
                    placeholder="Target"
                    isDisabled={edgeNodeOptions.length === 0}
                    options={edgeNodeOptions}
                    value={edgeTargetSel}
                    onChange={(opt) => {
                      setEdgeTargetSel(opt);
                      setFieldValue("target", opt?.value || "");
                    }}
                    styles={selectStyles}
                    noOptionsMessage={() =>
                      draftNodes.length === 0 ? "Agrega nodos primero" : "Sin coincidencias"
                    }
                  />
                  <ErrorMessage name="target" component="div" className="chf__error" />
                </label>

                <label className="chf__label">
                  Dirección
                  <Select
                    className="chf__select"
                    options={edgeDirOptions}
                    value={edgeDirection}
                    onChange={(opt) => setEdgeDirection(opt)}
                    placeholder="Dirección"
                    styles={selectStyles}
                  />
                </label>
              </div>

              <div className="chf__grid chf__grid--2 chf__grid--align-end">
                <label className="chf__label">
                  Etiqueta (centro)
                  <Field
                    className="chf__input"
                    placeholder="p.ej. TV7 Gi1/0/2 - Vlan420"
                    name="edgeLabel"
                  />
                  <ErrorMessage name="edgeLabel" component="div" className="chf__error" />
                </label>

                <label className="chf__label">
                  Multicast (origen)
                  <Field className="chf__input" placeholder="239.2.3.222" name="edgeMulticast" />
                  <ErrorMessage name="edgeMulticast" component="div" className="chf__error" />
                </label>
              </div>

              <div>
                <button
                  className="chf__btn chf__btn--secondary"
                  type="button"
                  onClick={async () => {
                    // Validamos SÓLO el bloque de enlaces con contexto
                    const errors = await validationSchema.validate(values, {
                      abortEarly: false,
                      context: { edgeAction: "add" },
                    }).then(() => ({})).catch((yerr) => {
                      const errMap = {};
                      if (yerr?.inner?.length) {
                        yerr.inner.forEach((e) => { errMap[e.path] = e.message; });
                      } else if (yerr?.path) {
                        errMap[yerr.path] = yerr.message;
                      }
                      return errMap;
                    });

                    // Validaciones extra (lógica de negocio)
                    if (values.source && values.target && values.source === values.target) {
                      errors.target = "Source y Target no pueden ser el mismo nodo.";
                    }
                    const srcNode = draftNodes.find((n) => n.id === values.source);
                    const tgtNode = draftNodes.find((n) => n.id === values.target);
                    if (!srcNode || !tgtNode) {
                      errors.source = errors.source || (!srcNode ? "Source no existe en borrador." : undefined);
                      errors.target = errors.target || (!tgtNode ? "Target no existe en borrador." : undefined);
                    }

                    if (Object.keys(errors).length) {
                      setErrors(errors);
                      setTouched({
                        edgeId: true,
                        source: true,
                        target: true,
                        edgeLabel: true,
                        edgeMulticast: true,
                      });
                      return;
                    }

                    const dir = edgeDirection.value;
                    const color = dir === "vuelta" ? "green" : "red";
                    const handleByDir = pickHandlesByGeometry(srcNode, tgtNode, dir);

                    const edge = {
                      id: values.edgeId.trim(),
                      source: values.source.trim(),
                      target: values.target.trim(),
                      sourceHandle: handleByDir.sourceHandle,
                      targetHandle: handleByDir.targetHandle,
                      label: values.edgeLabel?.trim() || values.edgeId.trim(),
                      type: "directional",
                      style: { stroke: color, strokeWidth: 2 },
                      markerEnd: { ...ARROW_CLOSED },
                      data: {
                        direction: dir,
                        label: values.edgeLabel?.trim() || values.edgeId.trim(),
                        multicast: values.edgeMulticast?.trim() || "",
                      },
                    };

                    if (draftEdges.some((e) => e.id === edge.id)) {
                      return Swal.fire({
                        icon: "warning",
                        title: "Enlace duplicado",
                        text: `Ya existe un enlace con id "${edge.id}".`,
                      });
                    }

                    setDraftEdges((prev) => [...prev, edge]);
                    setFieldValue("edgeId", "");
                    setFieldValue("source", "");
                    setFieldValue("target", "");
                    setFieldValue("edgeLabel", "");
                    setFieldValue("edgeMulticast", "");
                    setEdgeSourceSel(null);
                    setEdgeTargetSel(null);
                    setEdgeDirection(edgeDirOptions[0]);
                  }}
                >
                  + Agregar enlace
                </button>
              </div>

              {draftEdges.length > 0 && (
                <ul className="chf__list">
                  {draftEdges.map((e) => (
                    <li key={e.id} className="chf__list-item">
                      <code>{e.id}</code> — {e.source} ({e.sourceHandle}) → {e.target} ({e.targetHandle}) — {e.label}
                      {e?.data?.multicast ? (
                        <span className="chf__badge chf__badge--muted">mc: {e.data.multicast}</span>
                      ) : null}
                      <span className="chf__muted" style={{ marginLeft: 8, color: e.style?.stroke }}>
                        {e.data?.direction}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>

            <div className="chf__actions">
              <button
                className="chf__btn chf__btn--primary"
                type="submit"
                disabled={!selectedValue}
                title={!selectedValue ? "Seleccione una señal para continuar" : "Crear flujo"}
              >
                Crear flujo
              </button>
              <button className="chf__btn" type="button" onClick={() => navigate(-1)}>
                Cancelar
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ChannelForm;
