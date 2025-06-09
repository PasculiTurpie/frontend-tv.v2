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
}

const api = new Api("http://localhost:3000/api/v2");

export default api;
