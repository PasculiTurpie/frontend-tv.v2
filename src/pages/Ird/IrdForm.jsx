// pages/Ird/IrdForm.jsx (o donde tengas el form)
import { Formik, Field, Form } from "formik";
import { Link } from "react-router-dom";
import styles from "./Ird.module.css";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import { ipMulticastRegex, ipVideoMulticast } from "../../utils/regexValidate";

const IrdSchema = Yup.object().shape({
    nombreIrd: Yup.string().required("Campo obligatorio"),
    ipAdminIrd: Yup.string()
        .required("Campo obligatorio")
        .matches(/^172\.19\.\d{1,3}\.\d{1,3}$/, "Ingresa una ip válida"),
    marcaIrd: Yup.string().required("Campo obligatorio"),
    modelIrd: Yup.string().required("Campo obligatorio"),
    versionIrd: Yup.string().required("Campo obligatorio"),
    uaIrd: Yup.string().required("Campo obligatorio"),
    tidReceptor: Yup.string().required("Campo obligatorio"),
    typeReceptor: Yup.string().required("Campo obligatorio"),
    feqReceptor: Yup.string().required("Campo obligatorio"),
    symbolRateIrd: Yup.string().required("Campo obligatorio"),
    fecReceptorIrd: Yup.string().required("Campo obligatorio"),
    modulationReceptorIrd: Yup.string().required("Campo obligatorio"),
    rellOfReceptor: Yup.string().required("Campo obligatorio"),
    nidReceptor: Yup.string().required("Campo obligatorio"),
    cvirtualReceptor: Yup.string().required("Campo obligatorio"),
    vctReceptor: Yup.string().required("Campo obligatorio"),
    outputReceptor: Yup.string().required("Campo obligatorio"),
    multicastReceptor: Yup.string()
        .matches(ipMulticastRegex, "Debe ser una multicast válida")
        .required("Campo requerido"),
    ipVideoMulticast: Yup.string()
        .required("Campo obligatorio")
        .matches(ipVideoMulticast, "Debe ser una ip válida"),
    locationRow: Yup.string()
        .required("Campo obligatorio")
        .matches(/\d+/, "Ingrese un número"),
    locationCol: Yup.string()
        .required("Campo obligatorio")
        .matches(/\d+/, "Ingrese un número"),
});

const IrdForm = () => {
    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/listar-ird">Listar</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            Formulario
                        </li>
                    </ol>
                </nav>

                <Formik
                    initialValues={{
                        nombreIrd: "",
                        ipAdminIrd: "",
                        marcaIrd: "",
                        modelIrd: "",
                        versionIrd: "",
                        uaIrd: "",
                        tidReceptor: "",
                        typeReceptor: "",
                        feqReceptor: "",
                        symbolRateIrd: "",
                        fecReceptorIrd: "",
                        modulationReceptorIrd: "",
                        rellOfReceptor: "",
                        nidReceptor: "",
                        cvirtualReceptor: "",
                        vctReceptor: "",
                        outputReceptor: "",
                        multicastReceptor: "",
                        ipVideoMulticast: "",
                        locationRow: "",
                        locationCol: "",
                    }}
                    validationSchema={IrdSchema}
                    enableReinitialize={true}
                    onSubmit={async (values, { resetForm }) => {
                        try {
                            // 1) Crear IRD
                            const { data: ird } = await api.createIrd(values);

                            // 2) Crear Equipo EN SEGUNDO PLANO (no bloquea UX)
                            (async () => {
                                try {
                                    await api.createEquipo({
                                        nombre: values.nombreIrd,
                                        marca: values.marcaIrd,
                                        modelo: values.modelIrd,
                                        tipoNombre: "ird",
                                        ip_gestion: values.ipAdminIrd,
                                        irdRef: ird?._id,
                                    });
                                } catch (bgErr) {
                                    console.warn(
                                        "No se pudo crear Equipo desde IRD:",
                                        bgErr?.response?.data || bgErr
                                    );
                                }
                            })();

                            // 3) Feedback y reset
                            Swal.fire({
                                title: "Ird guardado exitosamente",
                                icon: "success",
                                html: `
                  <p><strong>Nombre IRD:</strong> ${values.nombreIrd}</p>
                  <p><strong>Marca:</strong> ${values.marcaIrd}</p>
                  <p><strong>Modelo:</strong> ${values.modelIrd}</p>
                `,
                            });
                            resetForm();
                        } catch (error) {
                            Swal.fire({
                                title: "Error",
                                icon: "error",
                                text: `Duplicidad de datos`,
                                footer: `${error?.response?.data?.message || error.message}`,
                            });
                        }
                    }}
                >
                    {({ errors, touched }) => (
                        <Form className="form__add">
                            <h1 className="form__titulo">Ingresa un Ird</h1>

                            <div className={styles.rows__group}>
                                <div className={styles.columns__group}>
                                    <div className="form__group">
                                        <label htmlFor="nombreIrd" className="form__group-label">
                                            Nombre
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre Ird"
                                                name="nombreIrd"
                                            />
                                        </label>
                                        {errors.nombreIrd && touched.nombreIrd ? (
                                            <div className="form__group-error">
                                                {errors.nombreIrd}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="marcaIrd" className="form__group-label">
                                            Marca
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="marcaIrd"
                                            />
                                        </label>
                                        {errors.marcaIrd && touched.marcaIrd ? (
                                            <div className="form__group-error">
                                                {errors.marcaIrd}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="modelIrd" className="form__group-label">
                                            Modelo
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="modelIrd"
                                            />
                                        </label>
                                        {errors.modelIrd && touched.modelIrd ? (
                                            <div className="form__group-error">
                                                {errors.modelIrd}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="ipAdminIrd" className="form__group-label">
                                            Ip administración
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="ipAdminIrd"
                                            />
                                        </label>
                                        {errors.ipAdminIrd && touched.ipAdminIrd ? (
                                            <div className="form__group-error">
                                                {errors.ipAdminIrd}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="versionIrd" className="form__group-label">
                                            Versión
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="versionIrd"
                                            />
                                        </label>
                                        {errors.versionIrd && touched.versionIrd ? (
                                            <div className="form__group-error">
                                                {errors.versionIrd}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="uaIrd" className="form__group-label">
                                            UA
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="uaIrd"
                                            />
                                        </label>
                                        {errors.uaIrd && touched.uaIrd ? (
                                            <div className="form__group-error">
                                                {errors.uaIrd}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* ########################################## */}
                                <div className={styles.columns__group}>
                                    <div className="form__group">
                                        <label htmlFor="tidReceptor" className="form__group-label">
                                            TID
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="tidReceptor"
                                            />
                                        </label>
                                        {errors.tidReceptor && touched.tidReceptor ? (
                                            <div className="form__group-error">
                                                {errors.tidReceptor}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label
                                            htmlFor="typeReceptor"
                                            className="form__group-label"
                                        >
                                            Tipo receptor
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="typeReceptor"
                                            />
                                        </label>
                                        {errors.typeReceptor && touched.typeReceptor ? (
                                            <div className="form__group-error">
                                                {errors.typeReceptor}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="feqReceptor" className="form__group-label">
                                            Frecuencia
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="feqReceptor"
                                            />
                                        </label>
                                        {errors.feqReceptor && touched.feqReceptor ? (
                                            <div className="form__group-error">
                                                {errors.feqReceptor}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label
                                            htmlFor="symbolRateIrd"
                                            className="form__group-label"
                                        >
                                            Symbol Rate
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="symbolRateIrd"
                                            />
                                        </label>
                                        {errors.symbolRateIrd && touched.symbolRateIrd ? (
                                            <div className="form__group-error">
                                                {errors.symbolRateIrd}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label
                                            htmlFor="fecReceptorIrd"
                                            className="form__group-label"
                                        >
                                            FEC
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="fecReceptorIrd"
                                            />
                                        </label>
                                        {errors.fecReceptorIrd && touched.fecReceptorIrd ? (
                                            <div className="form__group-error">
                                                {errors.fecReceptorIrd}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* ###################################### */}
                                <div className={styles.columns__group}>
                                    <div className="form__group">
                                        <label
                                            htmlFor="modulationReceptorIrd"
                                            className="form__group-label"
                                        >
                                            Modulación
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="modulationReceptorIrd"
                                            />
                                        </label>
                                        {errors.modulationReceptorIrd &&
                                            touched.modulationReceptorIrd ? (
                                            <div className="form__group-error">
                                                {errors.modulationReceptorIrd}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="rellOfReceptor" className="form__group-label">
                                            Roll Of
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="rellOfReceptor"
                                            />
                                        </label>
                                        {errors.rellOfReceptor && touched.rellOfReceptor ? (
                                            <div className="form__group-error">
                                                {errors.rellOfReceptor}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="nidReceptor" className="form__group-label">
                                            Nid
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="nidReceptor"
                                            />
                                        </label>
                                        {errors.nidReceptor && touched.nidReceptor ? (
                                            <div className="form__group-error">
                                                {errors.nidReceptor}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label
                                            htmlFor="cvirtualReceptor"
                                            className="form__group-label"
                                        >
                                            Canal Virtual
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="cvirtualReceptor"
                                            />
                                        </label>
                                        {errors.cvirtualReceptor && touched.cvirtualReceptor ? (
                                            <div className="form__group-error">
                                                {errors.cvirtualReceptor}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="vctReceptor" className="form__group-label">
                                            VCT
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="vctReceptor"
                                            />
                                        </label>
                                        {errors.vctReceptor && touched.vctReceptor ? (
                                            <div className="form__group-error">
                                                {errors.vctReceptor}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* ###################################### */}
                                <div className={styles.columns__group}>
                                    <div className="form__group">
                                        <label htmlFor="outputReceptor" className="form__group-label">
                                            Salida receptor
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="outputReceptor"
                                            />
                                        </label>
                                        {errors.outputReceptor && touched.outputReceptor ? (
                                            <div className="form__group-error">
                                                {errors.outputReceptor}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label
                                            htmlFor="multicastReceptor"
                                            className="form__group-label"
                                        >
                                            Multicast Receptor
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="multicastReceptor"
                                            />
                                        </label>
                                        {errors.multicastReceptor && touched.multicastReceptor ? (
                                            <div className="form__group-error">
                                                {errors.multicastReceptor}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="ipVideoMulticast" className="form__group-label">
                                            Ip Video Multicast
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="ipVideoMulticast"
                                            />
                                        </label>
                                        {errors.ipVideoMulticast && touched.ipVideoMulticast ? (
                                            <div className="form__group-error">
                                                {errors.ipVideoMulticast}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="locationRow" className="form__group-label">
                                            Fila
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="locationRow"
                                            />
                                        </label>
                                        {errors.locationRow && touched.locationRow ? (
                                            <div className="form__group-error">
                                                {errors.locationRow}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="form__group">
                                        <label htmlFor="locationCol" className="form__group-label">
                                            Bastidor
                                            <br />
                                            <Field
                                                type="text"
                                                className="form__group-input"
                                                placeholder="Nombre"
                                                name="locationCol"
                                            />
                                        </label>
                                        {errors.locationCol && touched.locationCol ? (
                                            <div className="form__group-error">
                                                {errors.locationCol}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className={`${styles.button} btn-primary`}>
                                Enviar
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </>
    );
};

export default IrdForm;
