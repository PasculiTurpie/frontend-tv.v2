import axios from "axios";
import {
    clearPersistedExpiry,
    getCurrentExpiry,
    normalizeDuration,
    normalizeExpiry,
    persistExpiry,
    readCookieExpiry,
} from "./sessionExpiry";

// --- Control de refresh único + cola ---
let isRefreshing = false;
let refreshPromise = null;
const queue = [];
function subscribeTokenRefresh(cb) {
    queue.push(cb);
}
function onRefreshed() {
    queue.forEach((cb) => cb());
    queue.length = 0;
}

const env = typeof import.meta !== "undefined" ? import.meta.env ?? {} : {};

const RAW_TITAN_TIMEOUT = env.VITE_TITAN_TIMEOUT;
const PARSED_TITAN_TIMEOUT = Number(RAW_TITAN_TIMEOUT);
const DEFAULT_TITAN_TIMEOUT = Number.isNaN(PARSED_TITAN_TIMEOUT)
    ? 10_000
    : PARSED_TITAN_TIMEOUT;

const DEFAULT_TITAN_OPTIONS = Object.freeze({
    path: env.VITE_TITAN_SERVICES_PATH || "/api/v1/servicesmngt/services",
    username: env.VITE_TITAN_USERNAME || "Operator",
    password: env.VITE_TITAN_PASSWORD || "titan",
    protocol: env.VITE_TITAN_PROTOCOL || "http",
    timeout: DEFAULT_TITAN_TIMEOUT,
});

function normalizeTitanOptions(pathOrOptions) {
    if (typeof pathOrOptions === "string") {
        return { path: pathOrOptions };
    }
    if (pathOrOptions && typeof pathOrOptions === "object") {
        const { path, username, password, protocol, timeout } = pathOrOptions;
        const normalized = {};
        if (path !== undefined) normalized.path = path;
        if (username !== undefined) normalized.username = username;
        if (password !== undefined) normalized.password = password;
        if (protocol !== undefined) normalized.protocol = protocol;
        if (timeout !== undefined) {
            const parsedTimeout = Number(timeout);
            if (!Number.isNaN(parsedTimeout)) {
                normalized.timeout = parsedTimeout;
            }
        }
        return normalized;
    }
    return {};
}

function extractExpiryFromData(data) {
    if (!data || typeof data !== "object") return null;

    const directKeys = [
        "at_exp",
        "accessExp",
        "access_exp",
        "accessTokenExp",
        "accessTokenExpiresAt",
        "access_token_exp",
        "access_token_expires_at",
        "expiresAt",
        "exp",
        "tokenExp",
        "token_exp",
        "expires",
    ];

    const durationKeys = [
        "expiresIn",
        "expires_in",
        "accessExpiresIn",
        "access_expires_in",
        "accessTokenExpiresIn",
        "ttl",
    ];

    const sources = [
        data,
        data.meta,
        data.access,
        data.token,
        data.tokens,
        data.tokens?.access,
        data.session,
        data.session?.access,
    ];

    for (const source of sources) {
        if (!source || typeof source !== "object") continue;

        for (const key of directKeys) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const expMs = normalizeExpiry(source[key]);
                if (expMs) return expMs;
            }
        }

        for (const key of durationKeys) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const expMs = normalizeDuration(source[key]);
                if (expMs) return expMs;
            }
        }
    }

    return null;
}

function resolveAndPersistExpiry(response) {
    const dataExpiry = extractExpiryFromData(response?.data);
    const cookieExpiry = readCookieExpiry();
    const existing = cookieExpiry ?? getCurrentExpiry();
    const candidate = dataExpiry ?? cookieExpiry ?? existing ?? null;
    const persisted = persistExpiry(candidate);
    return persisted ?? candidate ?? existing ?? null;
}

function dispatchAuthEvent(name, expiresAt) {
    window.dispatchEvent(
        new CustomEvent(name, {
            detail: {
                expiresAt: expiresAt ?? null,
            },
        })
    );
}

function handleAuthLogin(response) {
    const expiresAt = resolveAndPersistExpiry(response);
    dispatchAuthEvent("auth:login", expiresAt);
    return expiresAt;
}

function handleAuthRefresh(response) {
    const expiresAt = resolveAndPersistExpiry(response);
    dispatchAuthEvent("auth:refreshed", expiresAt);
    return expiresAt;
}

class Api {
    constructor(url) {
        this._axios = axios.create({ baseURL: url, withCredentials: true });

        this._axios.interceptors.request.use((config) => {
            return config; // backend lee cookies httpOnly
        });

        this._axios.interceptors.response.use(
            (res) => res,
            async (error) => {
                const original = error.config;
                const status = error?.response?.status;
                const code = error?.response?.data?.error;

                if (
                    status === 401 &&
                    code === "token_expired" &&
                    !original._retry
                ) {
                    original._retry = true;

                    if (!isRefreshing) {
                        isRefreshing = true;
                        refreshPromise = this._axios
                            .post("/auth/refresh")
                            .then((r) => {
                                isRefreshing = false;
                                onRefreshed();
                                handleAuthRefresh(r);
                                return r;
                            })
                            .catch((e) => {
                                isRefreshing = false;
                                onRefreshed();
                                clearPersistedExpiry();
                                throw e;
                            });
                    }

                    return new Promise((resolve, reject) => {
                        subscribeTokenRefresh(async () => {
                            try {
                                await refreshPromise;
                                resolve(this._axios(original));
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });
                }

                return Promise.reject(error);
            }
        );
    }

    // ====== AUTH ======
    login(values) {
        return this._axios.post("/auth/login", values).then((res) => {
            handleAuthLogin(res);
            return res.data;
        });
    }

    logout() {
        return this._axios.post("/auth/logout").then((res) => {
            clearPersistedExpiry();
            return res.data;
        });
    }

    refresh() {
        return this._axios.post("/auth/refresh").then((res) => {
            handleAuthRefresh(res);
            return res.data;
        });
    }

    profile() {
        return this._axios
            .get("/auth/me")
            .then((res) => res.data)
            .catch(async (e) => {
                if (e?.response?.status === 404) {
                    const r = await this._axios.get("/auth/me");
                    return r.data;
                }
                throw e;
            });
    }

    // ====== API ======
    createUser(values) {
        return this._axios.post("/user", values).then((r) => r.data);
    }
    updateUserId(id, values) {
        return this._axios.put(`/user/${id}`, values).then((r) => r.data);
    }
    getUserInfo() {
        return this._axios.get("/users").then((r) => r.data);
    }
    getUserId(id) {
        return this._axios.get(`/user/${id}`).then((r) => r.data);
    }
    deleteUserId(id) {
        return this._axios.delete(`/user/${id}`).then((r) => r.data);
    }

    createSatelite(values) {
        return this._axios.post("/satelite", values).then((r) => r.data);
    }
    getSatellites() {
        return this._axios.get("/satelite").then((r) => r.data);
    }
    getSatelliteId(id) {
        return this._axios.get(`/satelite/${id}`).then((r) => r.data);
    }
    deleteSatelliteId(id) {
        return this._axios.delete(`/satelite/${id}`).then((r) => r.data);
    }
    updateSatelite(values, id) {
        return this._axios.put(`/satelite/${id}`, values).then((r) => r.data);
    }

    getPolarizations() {
        return this._axios.get("/polarization").then((r) => r.data);
    }

    getSignal() {
        return this._axios.get("/signal").then((r) => r);
    }
    createSignal(values) {
        return this._axios.post("/signal", values).then((r) => r.data);
    }
    getIdSignal(id) {
        return this._axios.get(`/signal/${id}`).then((r) => r);
    }
    deleteSignal(id) {
        return this._axios.delete(`/signal/${id}`).then((r) => r);
    }
    updateSignal(id, values) {
        return this._axios.put(`/signal/${id}`, values).then((r) => r.data);
    }
    searchFilter(keyword) {
        return this._axios.get(`/search?keyword=${keyword}`).then((r) => r);
    }

    getIrd() {
        return this._axios.get("/ird").then((r) => r);
    }
    createIrd(values) {
        return this._axios.post("/ird", values).then((r) => r.data);
    }
    getIdIrd(id) {
        return this._axios.get(`/ird/${id}`).then((r) => r);
    }
    deleteIrd(id) {
        return this._axios.delete(`/ird/${id}`).then((r) => r);
    }
    updateIrd(id, values) {
        return this._axios.put(`/ird/${id}`, values).then((r) => r.data);
    }

    validateExcelIrds(file) {
        const formData = new FormData();
        formData.append("file", file);
        return this._axios
            .post("/irds/validate-excel", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((r) => r.data);
    }

    bulkCreateIrds(file) {
        const formData = new FormData();
        formData.append("file", file);
        return this._axios
            .post("/irds/bulk-create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((r) => r.data);
    }

    getEquipo() {
        return this._axios.get("/equipo").then((r) => r);
    }
    deleteEquipo(id) {
        return this._axios.delete(`/equipo/${id}`).then((r) => r);
    }
    createEquipo(values) {
        return this._axios.post("/equipo", values).then((r) => r.data);
    }
    getIdEquipo(id) {
        return this._axios.get(`/equipo/${id}`).then((r) => r);
    }
    updateEquipo(id, values) {
        return this._axios.put(`/equipo/${id}`, values).then((r) => r);
    }

    getTipoEquipo() {
        return this._axios.get("/tipo-equipo").then((r) => r);
    }
    deleteTipoEquipo(id) {
        return this._axios.delete(`/tipo-equipo/${id}`).then((r) => r);
    }
    createTipoEquipo(values) {
        return this._axios.post("/tipo-equipo", values).then((r) => r.data);
    }
    getIdTipoEquipo(id) {
        return this._axios.get(`/tipo-equipo/${id}`).then((r) => r);
    }
    updateTipoEquipo(id, values) {
        return this._axios.put(`/tipo-equipo/${id}`, values).then((r) => r);
    }

    getContact() {
        return this._axios.get("/contact").then((r) => r);
    }
    deleteContact(id) {
        return this._axios.delete(`/contact/${id}`).then((r) => r);
    }
    createContact(values) {
        return this._axios.post("/contact", values).then((r) => r.data);
    }
    getIdContact(id) {
        return this._axios.get(`/contact/${id}`).then((r) => r);
    }
    updateContact(id, values) {
        return this._axios.put(`/contact/${id}`, values).then((r) => r);
    }

    getTipoTech() {
        return this._axios.get("/tecnologia").then((r) => r);
    }
    deleteTipoTech(id) {
        return this._axios.delete(`/tecnologia/${id}`).then((r) => r);
    }
    createTipoTech(values) {
        return this._axios.post("/tecnologia", values).then((r) => r.data);
    }
    getIdTipoTech(id) {
        return this._axios.get(`/tecnologia/${id}`).then((r) => r);
    }
    updateTipoTech(id, values) {
        return this._axios.put(`/tecnologia/${id}`, values).then((r) => r);
    }

    createChannelDiagram(payload) {
        return this._axios.post(`/channels`, payload).then((r) => r.data);
    }
    getChannelDiagramById(id) {
        return this._axios.get(`/channels/${id}`).then((r) => r);
    }
    getChannelDiagram() {
        return this._axios.get(`/channels`).then((r) => r);
    }
    getChannelDiagramBySignal(signalId) {
        if (!signalId) {
            return Promise.resolve([]);
        }
        return this._axios
            .get(`/channels`, { params: { signal: signalId } })
            .then((r) => r.data);
    }
    updateChannelDiagram(id, payload) {
        return this._axios.put(`/channels/${id}`, payload).then((r) => r.data);
    }
    deleteChannelDiagram(id) {
        return this._axios.delete(`/channels/${id}`).then((r) => r.data);
    }
    updateChannelFlow(id, payload) {
        return this._axios
            .put(`/channels/${id}/flow`, payload)
            .then((r) => r.data);
    }

    // ====== TITANS ======
    async getTitanServices(host, pathOrOptions = undefined) {
        if (!host) {
            throw new Error("Titan host is required");
        }

        const options = {
            ...DEFAULT_TITAN_OPTIONS,
            ...normalizeTitanOptions(pathOrOptions),
        };

        const path = options.path ?? DEFAULT_TITAN_OPTIONS.path;
        const username = options.username ?? DEFAULT_TITAN_OPTIONS.username;
        const password = options.password ?? DEFAULT_TITAN_OPTIONS.password;
        const protocol = options.protocol ?? DEFAULT_TITAN_OPTIONS.protocol;
        const timeout = options.timeout ?? DEFAULT_TITAN_OPTIONS.timeout;

        const baseUrl = `${protocol}://${host}`;
        const targetUrl = new URL(path, baseUrl).toString();

        const config = {
            headers: { Accept: "application/json" },
            timeout,
        };

        if (username || password) {
            config.auth = {
                username: username ?? "",
                password: password ?? "",
            };
        }

        const response = await axios.get(targetUrl, config);
        return response.data;
    }
    async getTitanServicesMulti(hosts, pathOrOptions = undefined) {
        const normalizedHosts = Array.isArray(hosts)
            ? hosts
            : typeof hosts === "string"
            ? hosts
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
            : [];

        const uniqueHosts = Array.from(new Set(normalizedHosts));

        const results = await Promise.allSettled(
            uniqueHosts.map(async (host) => {
                const payload = await this.getTitanServices(host, pathOrOptions);
                return { ok: true, host, ip: host, data: payload };
            })
        );

        return results.map((entry, index) => {
            const host = uniqueHosts[index];
            if (entry.status === "fulfilled") {
                return entry.value;
            }

            const error = entry.reason;
            const output = { ok: false, host, ip: host };

            if (error && typeof error === "object") {
                if (error.response) {
                    output.status = error.response.status;
                    output.statusText = error.response.statusText;
                    output.error = error.response.data ?? error.response.statusText;
                } else if (error.message) {
                    output.error = error.message;
                } else {
                    output.error = error;
                }
            } else {
                output.error = error;
            }

            return output;
        });
    }

    // ====== AUDIT ======
    getAuditLogs(params = {}) {
        const qs = new URLSearchParams();
        const push = (k, v) => {
            if (v === undefined || v === null || v === "") return;
            if (Array.isArray(v))
                v.forEach((item) => qs.append(k, String(item)));
            else qs.set(k, String(v));
        };
        push("page", params.page);
        push("limit", params.limit);
        push("sort", params.sort);
        push("q", params.q);
        push("userId", params.userId);
        push("email", params.email);
        push("action", params.action);
        push("method", params.method);
        push("ip", params.ip);
        push("resource", params.resource);
        push("status", params.status);
        push("statusMin", params.statusMin);
        push("statusMax", params.statusMax);
        push("dateFrom", params.dateFrom);
        push("dateTo", params.dateTo);

        const query = qs.toString();
        const url = `/audit${query ? `?${query}` : ""}`;
        return this._axios.get(url).then((res) => res.data);
    }

    exportAuditLogsCSV(params = {}) {
        const qs = new URLSearchParams();
        const push = (k, v) => {
            if (v === undefined || v === null || v === "") return;
            if (Array.isArray(v))
                v.forEach((item) => qs.append(k, String(item)));
            else qs.set(k, String(v));
        };
        [
            "page",
            "limit",
            "sort",
            "q",
            "userId",
            "email",
            "action",
            "method",
            "ip",
            "resource",
            "status",
            "statusMin",
            "statusMax",
            "dateFrom",
            "dateTo",
        ].forEach((k) => push(k, params[k]));

        const query = qs.toString();
        const url = `/audit/export${query ? `?${query}` : ""}`;
        return this._axios.get(url, { responseType: "blob" });
    }
}

const api = new Api(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v2"
);
export default api;
