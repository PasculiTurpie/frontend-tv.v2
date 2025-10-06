import { getCookie } from "./cookies";

const STORAGE_KEY = "__session_expiry_ms__";
let memoryExpMs = null;

const now = () => Date.now();

function getSessionStorageSafe() {
    if (typeof window === "undefined") return null;
    try {
        return window.sessionStorage ?? null;
    } catch {
        return null;
    }
}

export function normalizeExpiry(value) {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value.getTime();
    if (typeof value === "number") {
        if (!Number.isFinite(value) || value <= 0) return null;
        return value > 1e12 ? value : value * 1000;
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        const numeric = Number(trimmed);
        if (!Number.isNaN(numeric)) {
            return normalizeExpiry(numeric);
        }
        const parsed = Date.parse(trimmed);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }
    return null;
}

export function normalizeDuration(value) {
    if (value === null || value === undefined) return null;
    const numeric = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    return now() + numeric * 1000;
}

export function persistExpiry(value) {
    const expMs = normalizeExpiry(value);
    if (!expMs || expMs <= now()) return null;
    memoryExpMs = expMs;
    const storage = getSessionStorageSafe();
    if (storage) {
        try {
            storage.setItem(STORAGE_KEY, String(expMs));
        } catch {
            // ignore storage quota errors
        }
    }
    return expMs;
}

function readFromStorage() {
    const storage = getSessionStorageSafe();
    if (!storage) return null;
    try {
        const stored = storage.getItem(STORAGE_KEY);
        if (!stored) return null;
        const normalized = normalizeExpiry(stored);
        if (!normalized || normalized <= now()) return null;
        memoryExpMs = normalized;
        return normalized;
    } catch {
        return null;
    }
}

export function readCookieExpiry() {
    const raw = getCookie("at_exp");
    if (!raw) return null;
    const normalized = normalizeExpiry(raw);
    if (!normalized || normalized <= now()) return null;
    memoryExpMs = normalized;
    return normalized;
}

export function getCurrentExpiry() {
    if (memoryExpMs && memoryExpMs > now()) {
        return memoryExpMs;
    }
    const fromStorage = readFromStorage();
    if (fromStorage) return fromStorage;
    const fromCookie = readCookieExpiry();
    if (fromCookie) {
        persistExpiry(fromCookie);
        return fromCookie;
    }
    return null;
}

export function clearPersistedExpiry() {
    memoryExpMs = null;
    const storage = getSessionStorageSafe();
    if (storage) {
        try {
            storage.removeItem(STORAGE_KEY);
        } catch {
            // ignore
        }
    }
}
