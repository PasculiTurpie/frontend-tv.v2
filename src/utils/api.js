import axios from "axios";

class Api {
    constructor(url) {
        this._url = url;

        this._axios = axios.create({
            baseURL: this._url,
            withCredentials: true, // Se envían cookies en cada solicitud
        });
    }

    /*LOGIN & LOGOUT */

    login(values) {
        return this._axios.post("/auth/login", values).then((res) => res.data);
    }
    logout() {
        return this._axios.post("/auth/logout").then((res) => res.data);
    }

    profile() {
        return this._axios.get("/auth/profile").then((res) => res.data);
    }

    /* Rutas para gestión de usuarios */

    createUser(values) {
        return this._axios.post("/user", values).then((res) => res.data);
    }
    updateUserId(id, values) {
        return this._axios.put(`/user/${id}`, values).then((res) => res.data);
    }

    getUserInfo() {
        return this._axios.get("/users").then((res) => res.data);
    }
    getUserId(id) {
        return this._axios.get(`/user/${id}`).then((res) => res.data);
    }
    deleteUserId(id) {
        return this._axios.delete(`/user/${id}`).then((res) => res.data);
    }

    /* Rutas para gestión de satelites */

    createSatelite(values) {
        return this._axios.post("/satelite", values).then((res) => res.data);
    }

    getSatellites() {
        return this._axios.get("/satelite").then((res) => res.data);
    }
    getSatelliteId(id) {
        return this._axios.get(`/satelite/${id}`).then((res) => res.data);
    }
    deleteSatelliteId(id) {
        return this._axios.delete(`/satelite/${id}`).then((res) => res.data);
    }
    updateSatelite(values, id) {
        return this._axios
            .put(`/satelite/${id}`, values)
            .then((res) => res.data);
    }

    /* Rutas para gestión de polarizaciones */

    getPolarizations() {
        return this._axios.get("/polarization").then((res) => res.data);
    }

    /* Rutas para gestión de Señal */

    /*    getSignal() {
        return this._axios.get("/signal").then((res) => res.data);
    }

 */
    getSignal() {
        return this._axios.get("/signal").then((res) => res);
    }

    createSignal(values) {
        return this._axios.post("/signal", values).then((res) => res.data);
    }
    getIdSignal(id) {
        return this._axios.get(`/signal/${id}`).then((res) => res);
    }
    deleteSignal(id) {
        return this._axios.delete(`/signal/${id}`).then((res) => res);
    }
    updateSignal(id, values) {
        return this._axios.put(`/signal/${id}`, values).then((res) => res.data);
    }

    searchFilter(keyword) {
        return this._axios.get(`/search?keyword=${keyword}`).then((res) => res);
    }

    /*Rutas para gestión de IRD*/
    getIrd() {
        return this._axios.get("/ird").then((res) => res);
    }
    createIrd(values) {
        return this._axios.post("/ird", values).then((res) => res.data);
    }
    getIdIrd(id) {
        return this._axios.get(`/ird/${id}`).then((res) => res);
    }
    deleteIrd(id) {
        return this._axios.delete(`/ird/${id}`).then((res) => res);
    }
    updateIrd(id, values) {
        return this._axios.put(`/ird/${id}`, values).then((res) => res.data);
    }
    /*Rutas para gestión DCM*/
    getDcm() {
        return this._axios.get("/dcm").then((res) => res);
    }
    deleteDcm(id) {
        return this._axios.delete(`/dcm/${id}`).then((res) => res);
    }
    createDcm(values) {
        return this._axios.post("/dcm", values).then((res) => res.data);
    }

    getIdDcm(id) {
        return this._axios.get(`/dcm/${id}`).then((res) => res);
    }
    updateDcm(id, values) {
        return this._axios.put(`/dcm/${id}`, values).then((res) => res);
    }

    /*Rutas para gestión DCM*/

    getTitan() {
        return this._axios.get("/titan").then((res) => res);
    }
    deleteTitan(id) {
        return this._axios.delete(`/titan/${id}`).then((res) => res);
    }
    createTitan(values) {
        return this._axios.post("/titan", values).then((res) => res.data);
    }

    getIdTitan(id) {
        return this._axios.get(`/titan/${id}`).then((res) => res);
    }
    updateTitan(id, values) {
        return this._axios.put(`/titan/${id}`, values).then((res) => res);
    }

    /*Rutas para gestión DCMVMX*/

    getDcmVmx() {
        return this._axios.get("/dcmVmx").then((res) => res);
    }
    deleteDcmVmx(id) {
        return this._axios.delete(`/dcmVmx/${id}`).then((res) => res);
    }
    createDcmVmx(values) {
        return this._axios.post("/dcmVmx", values).then((res) => res.data);
    }

    getIdDcmVmx(id) {
        return this._axios.get(`/dcmVmx/${id}`).then((res) => res);
    }
    updateDcmVmx(id, values) {
        return this._axios.put(`/dcmVmx/${id}`, values).then((res) => res);
    }

    /*Rutas para gestión RTESVMX*/
    getRtesVmx() {
        return this._axios.get("/rtesVmx").then((res) => res);
    }
    deleteRtesVmx(id) {
        return this._axios.delete(`/rtesVmx/${id}`).then((res) => res);
    }
    createRtesVmx(values) {
        return this._axios.post("/rtesVmx", values).then((res) => res.data);
    }

    getIdRtesVmx(id) {
        return this._axios.get(`/rtesVmx/${id}`).then((res) => res);
    }
    updateRtesVmx(id, values) {
        return this._axios.put(`/rtesVmx/${id}`, values).then((res) => res);
    }

    /*Rutas para gestión Switch*/
    getSwitch() {
        return this._axios.get("/switch").then((res) => res);
    }
    deleteSwitch(id) {
        return this._axios.delete(`/switch/${id}`).then((res) => res);
    }
    createSwitch(values) {
        return this._axios.post("/switch", values).then((res) => res.data);
    }

    getIdSwitch(id) {
        return this._axios.get(`/switch/${id}`).then((res) => res);
    }
    updateSwitch(id, values) {
        return this._axios.put(`/switch/${id}`, values).then((res) => res);
    }

    /*Rutas para gestión Equipo*/
    getEquipo() {
        return this._axios.get("/equipo").then((res) => res);
    }
    deleteEquipo(id) {
        return this._axios.delete(`/equipo/${id}`).then((res) => res);
    }
    createEquipo(values) {
        return this._axios.post("/equipo", values).then((res) => res.data);
    }

    getIdEquipo(id) {
        return this._axios.get(`/equipo/${id}`).then((res) => res);
    }
    updateEquipo(id, values) {
        return this._axios.put(`/equipo/${id}`, values).then((res) => res);
    }

    /*Rutas para gestión Tipo Equipo*/
    getTipoEquipo() {
        return this._axios.get("/tipo-equipo").then((res) => res);
    }
    deleteTipoEquipo(id) {
        return this._axios.delete(`/tipo-equipo/${id}`).then((res) => res);
    }
    createTipoEquipo(values) {
        return this._axios.post("/tipo-equipo", values).then((res) => res.data);
    }

    getIdTipoEquipo(id) {
        return this._axios.get(`/tipo-equipo/${id}`).then((res) => res);
    }
    updateTipoEquipo(id, values) {
        return this._axios.put(`/tipo-equipo/${id}`, values).then((res) => res);
    }
    /*Rutas para gestión Contacto*/
    getContact() {
        return this._axios.get("/contact").then((res) => res);
    }
    deleteContact(id) {
        return this._axios.delete(`/contact/${id}`).then((res) => res);
    }
    createContact(values) {
        return this._axios.post("/contact", values).then((res) => res.data);
    }

    getIdContact(id) {
        return this._axios.get(`/contact/${id}`).then((res) => res);
    }
    updateContact(id, values) {
        return this._axios.put(`/contact/${id}`, values).then((res) => res);
    }
    /*Rutas para gestión Tipo tecnología*/
    getTipoTech() {
        return this._axios.get("/tecnologia").then((res) => res);
    }
    deleteTipoTech(id) {
        return this._axios.delete(`/tecnologia/${id}`).then((res) => res);
    }
    createTipoTech(values) {
        return this._axios.post("/tecnologia", values).then((res) => res.data);
    }

    getIdTipoTech(id) {
        return this._axios.get(`/tecnologia/${id}`).then((res) => res);
    }
    updateTipoTech(id, values) {
        return this._axios.put(`/tecnologia/${id}`, values).then((res) => res);
    }

    /*Rutas para gestión ChannelDiagram*/

    getChannelDiagramById(id) {
        return this._axios.get(`/channels/${id}`).then((res) => res);
    }
    getChannelDiagram() {
        return this._axios.get(`/channels`).then((res) => res);
    }
}

const api = new Api("http://localhost:3000/api/v2");

export default api;
