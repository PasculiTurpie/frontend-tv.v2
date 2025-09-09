import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";

// ---------------- Validaciones ----------------
const SatelliteSchema = Yup.object().shape({
    satelliteName: Yup.string().required("Campo obligatorio"),
    satelliteUrl: Yup.string()
        .test(
            "starts-with-http",
            "La URL debe comenzar con http:// o https://",
            (value) => value?.startsWith("http://") || value?.startsWith("https://")
        )
        .url("Debe ser una URL válida")
        .required("La URL es obligatoria"),
    satelliteType: Yup.string()
        .notOneOf(["0", "default"], "Debes seleccionar una opción válida.")
        .required("Campo obligatorio"),
});

const SatelliteForm = () => {
    const [polarizations, setPolarizations] = useState([]);
    const nameInputRef = useRef(null);

    // Mapa de tipos de equipo (por nombre en minúsculas → ObjectId)
    const [tipoMap, setTipoMap] = useState({});
    const [loadingTipos, setLoadingTipos] = useState(false);

    useEffect(() => {
        // Cargar polarizaciones
        api
            .getPolarizations()
            .then((response) => {
                // api.getPolarizations() ya devuelve res.data => array
                setPolarizations(response || []);
            })
            .catch((error) => {
                console.error("Error fetching polarizations:", error);
            });
    }, []);

    useEffect(() => {
        // Cargar tipos de equipo una vez
        let mounted = true;
        (async () => {
            try {
                setLoadingTipos(true);
                const res = await api.getTipoEquipo(); // { data: [...] }
                const arr = res?.data || [];
                const map = {};
                for (const t of arr) {
                    if (t?.tipoNombre && t?._id) {
                        map[String(t.tipoNombre).toLowerCase()] = t._id;
                    }
                }
                if (mounted) setTipoMap(map);
            } catch (err) {
                console.warn("No se pudo cargar TipoEquipo:", err?.response?.data || err);
            } finally {
                if (mounted) setLoadingTipos(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // Asegura que exista/consigue el ObjectId del tipo "satelite"
    const ensureTipoId = async (name = "satelite") => {
        const key = String(name).toLowerCase();
        if (tipoMap[key]) return tipoMap[key];

        // Intentar crearlo si no existe
        try {
            const created = await api.createTipoEquipo({ tipoNombre: name });
            const id = created?._id;
            if (id) {
                setTipoMap((prev) => ({ ...prev, [key]: id }));
                return id;
            }
        } catch (e) {
            // Si falla crear, refrescar listado por si existe
            try {
                const res = await api.getTipoEquipo();
                const arr = res?.data || [];
                const found = arr.find((t) => String(t?.tipoNombre).toLowerCase() === key);
                if (found?._id) {
                    setTipoMap((prev) => ({ ...prev, [key]: found._id }));
                    return found._id;
                }
            } catch (e2) {
                // noop
            }
            throw new Error("No existe ni se pudo crear el TipoEquipo 'satelite'.");
        }
    };

    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/listar-satelite">Listar</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            Formulario
                        </li>
                    </ol>
                </nav>

                <Formik
                    initialValues={{
                        satelliteName: "",
                        satelliteUrl: "",
                        satelliteType: "",
                    }}
                    validationSchema={SatelliteSchema}
                    enableReinitialize={true}
                    onSubmit={async (values, { resetForm }) => {
                        if (loadingTipos) {
                            Swal.fire({
                                icon: "info",
                                title: "Cargando tipos de equipo…",
                                text: "Espera un momento e intenta nuevamente.",
                            });
                            return;
                        }

                        try {
                            // 1) Crear Satélite
                            const satelite = await api.createSatelite(values); // debe devolver el objeto creado
                            const satId = satelite?._id;

                            // 2) Conseguir ObjectId del TipoEquipo 'satelite'
                            const tipoSatId = await ensureTipoId("satelite");

                            // 3) Crear Equipo asociado al Satélite (referencia: sateliteRef)
                            let equipoOk = true;
                            let equipoMsg = "";
                            try {
                                await api.createEquipo({
                                    nombre: values.satelliteName,
                                    marca: "SAT",              // defaults mínimos requeridos por tu schema
                                    modelo: "SATELLITE",       // puedes ajustar si quieres guardar más info
                                    tipoNombre: tipoSatId,     // ObjectId del tipo 'satelite'
                                    // ip_gestion: opcional; no proviene del form de satélite
                                    sateliteRef: satId,        // <-- requiere que el schema de Equipo tenga este campo
                                });
                                equipoMsg = "Equipo creado correctamente.";
                            } catch (bgErr) {
                                equipoOk = false;
                                equipoMsg =
                                    bgErr?.response?.data?.message ||
                                    "No se pudo crear Equipo desde Satélite.";
                                console.warn("No se pudo crear Equipo:", bgErr?.response?.data || bgErr);
                            }

                            // 4) Mostrar confirmación
                            const selectedPolarization = polarizations.find(
                                (p) => p._id === values.satelliteType
                            );
                            const polarizationName =
                                selectedPolarization?.typePolarization || "Desconocido";

                            Swal.fire({
                                title: "Satélite guardado",
                                icon: "success",
                                html: `
                  <div style="text-align:left">
                    <div><b>Nombre Satélite:</b> ${values.satelliteName}</div>
                    <div><b>Polarización:</b> ${polarizationName}</div>
                    <div><b>URL:</b> ${values.satelliteUrl}</div>
                    <hr/>
                    <div><b>Equipo:</b> ${equipoOk ? "Creado" : "No creado"}</div>
                    <div style="color:${equipoOk ? "#065f46" : "#991b1b"}">${equipoMsg}</div>
                  </div>
                `,
                            }).then(() => {
                                resetForm();
                                nameInputRef.current?.focus();
                            });
                        } catch (error) {
                            Swal.fire({
                                title: "Error",
                                icon: "error",
                                text: "No se pudo crear el Satélite",
                                footer: `${error?.response?.data?.message || error.message}`,
                            });
                        }
                    }}
                >
                    {({ errors, touched }) => (
                        <Form className="form__add">
                            <h1 className="form__titulo">Ingresa un satélite</h1>

                            <div className="form__group">
                                <label htmlFor="satelliteName" className="form__group-label">
                                    Nombre de Satélite
                                    <br />
                                    <Field
                                        innerRef={nameInputRef}
                                        type="text"
                                        className="form__group-input"
                                        placeholder="Nombre"
                                        name="satelliteName"
                                    />
                                </label>
                                {errors.satelliteName && touched.satelliteName ? (
                                    <div className="form__group-error">{errors.satelliteName}</div>
                                ) : null}
                            </div>

                            <div className="form__group">
                                <label htmlFor="satelliteUrl" className="form__group-label">
                                    Url web
                                    <br />
                                    <Field
                                        type="text"
                                        className="form__group-input"
                                        placeholder="http(s)://…"
                                        name="satelliteUrl"
                                    />
                                </label>
                                {errors.satelliteUrl && touched.satelliteUrl ? (
                                    <div className="form__group-error">{errors.satelliteUrl}</div>
                                ) : null}
                            </div>

                            <div className="form__group">
                                <label htmlFor="satelliteType" className="form__group-label">
                                    Selecciona la polaridad
                                    <br />
                                    <Field as="select" className="form__group-input" name="satelliteType">
                                        <option value={"0"}>--Seleccionar--</option>
                                        {polarizations.map((polarization) => (
                                            <option key={polarization._id} value={polarization._id}>
                                                {polarization.typePolarization}
                                            </option>
                                        ))}
                                    </Field>
                                </label>
                                {errors.satelliteType && touched.satelliteType ? (
                                    <div className="form__group-error">{errors.satelliteType}</div>
                                ) : null}
                            </div>

                            <button type="submit" className="button btn-primary">
                                Enviar
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </>
    );
};

export default SatelliteForm;
