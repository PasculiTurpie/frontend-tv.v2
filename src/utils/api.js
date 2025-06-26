import axios from "axios";

class Api {
    constructor(url) {
        this._url = url;

        this._axios = axios.create({
            baseURL: this._url,
            /* withCredentials: true, */
        });
    }

    /* Rutas para gestión de usuarios */

    createUser(values) {
        return this._axios.post("/user", values).then((res) => res.data);
    }
    updateUserId(id, values) {
        return this._axios.put(`/user/${id}`, values).then((res) => res.data);
    }

    getUserInfo() {
        return this._axios.get("/user").then((res) => res.data);
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

    getSignal() {
        return this._axios.get("/signal").then((res) => res.data);
    }

    /*Rutas para gestión Ird's */
    getSignal() {
        return this._axios.get("/signal").then((res) => res);
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
}

const api = new Api("http://localhost:3000/api/v2");

export default api;
