// src/pages/ServicesMultiHost.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

/**
 * Listado de Señales desde múltiples hosts Titan
 * - Consulta en paralelo http://<IP>/api/v1/servicesmngt/services
 * - Basic Auth: Operator / titan
 * - Columnas: Name, Input.IPInputList.Url, Outputs[0].Outputs, State.State
 * - Proxy ACTIVADO por defecto (PROXY_BASE = "/proxy/services")
 * - Botón Exportar CSV (aplica al filtrado)
 */

// Protocolo para llamadas directas (solo si USE_PROXY=false)
const PROTOCOL = "http";

// Usa proxy por defecto (Vite reenvía a backend:3001)
const USE_PROXY = true;
const PROXY_BASE = "/proxy/services"; // en prod, Nginx/ingress puede apuntar al backend

// Hosts proporcionados
const HOSTS = [
  { label: "TL-HOST_109", ip: "172.19.14.109" },
  { label: "TL-HOST_112", ip: "172.19.14.112" },
  { label: "TL-HOST_113", ip: "172.19.14.113" },
  { label: "TL-HOST_118", ip: "172.19.14.118" },
  { label: "TL-HOST_120", ip: "172.19.14.120" },
  { label: "TL-HOST_121", ip: "172.19.14.121" },
  { label: "TL-HOST_123", ip: "172.19.14.123" },
  { label: "TL-HOST_125", ip: "172.19.14.125" },
  { label: "TL-HOST_140", ip: "172.19.14.140" },
  { label: "TL-HOST_156", ip: "172.19.14.156" },
  { label: "TL-HOST_157", ip: "172.19.14.157" },
  { label: "TL-HOST_158", ip: "172.19.14.158" },
  { label: "TL-HOST_164", ip: "172.19.14.164" }
];

// Credenciales (mueve a .env en producción)
const BASIC_USER = "Operator";
const BASIC_PASS = "titan";

// Timeout y reintentos por host
const REQUEST_TIMEOUT_MS = 10_000;
const RETRIES_PER_HOST = 1;

function b64Basic(user, pass) {
  return typeof btoa === "function"
    ? btoa(`${user}:${pass}`)
    : Buffer.from(`${user}:${pass}`).toString("base64");
}

function pickFirst(...cands) {
  for (const v of cands) if (v !== undefined && v !== null) return v;
  return undefined;
}

function extractServicesArray(resp) {
  const r = resp ?? {};
  if (Array.isArray(r)) return r;
  if (Array.isArray(r.services)) return r.services;
  if (Array.isArray(r.Services)) return r.Services;
  if (Array.isArray(r.data?.services)) return r.data.services;
  if (Array.isArray(r.data?.Services)) return r.data.Services;
  if (Array.isArray(r.result)) return r.result;
  return [];
}

function extractRow(hostLabel, ip, svc) {
  const name = pickFirst(svc?.Name, svc?.name, svc?.ServiceName, svc?.serviceName);

  // Input.IPInputList.Url (varias formas)
  const inputUrl = pickFirst(
    svc?.Input?.IPInputList?.[0]?.Url,
    svc?.Input?.IPInputList?.Url,
    svc?.IPInputList?.[0]?.Url,
    svc?.IPInputList?.Url,
    svc?.Input?.Url,
    svc?.InputUrl
  );

  // Outputs[0].Outputs
  let outputsRaw = pickFirst(
    Array.isArray(svc?.Outputs) ? svc?.Outputs?.[0]?.Outputs : undefined,
    Array.isArray(svc?.Outputs) ? svc?.Outputs?.[0] : undefined,
    svc?.Outputs,
    svc?.Output
  );

  let outputs;
  if (Array.isArray(outputsRaw)) {
    outputs = outputsRaw.map((o) => (typeof o === "string" ? o : JSON.stringify(o))).join(", ");
  } else if (typeof outputsRaw === "object" && outputsRaw !== null) {
    outputs = JSON.stringify(outputsRaw);
  } else {
    outputs = outputsRaw ?? "";
  }

  // State.State
  const stateVal = pickFirst(svc?.State?.State, svc?.state?.state, svc?.State, svc?.state);

  return {
    host: hostLabel,
    ip,
    name: name ?? "(sin nombre)",
    inputUrl: inputUrl ?? "",
    outputs,
    state: typeof stateVal === "object" ? JSON.stringify(stateVal) : stateVal ?? ""
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function queryHost(ip) {
  const headers = {
    Authorization: `Basic ${b64Basic(BASIC_USER, BASIC_PASS)}`,
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  const url = USE_PROXY
    ? `${PROXY_BASE}?host=${encodeURIComponent(ip)}`
    : `${PROTOCOL}://${ip}/api/v1/servicesmngt/services`;

  const res = await fetchWithTimeout(url, { method: "GET", headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  try {
    return await res.json();
  } catch {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Respuesta no es JSON válido");
    }
  }
}

// CSV helpers
function escapeCsvField(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows) {
  const headers = ["Host", "IP", "Name", "Input.IPInputList.Url", "Outputs[0].Outputs", "State.State"];
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.host,
        r.ip,
        r.name,
        r.inputUrl,
        typeof r.outputs === "string" ? r.outputs : JSON.stringify(r.outputs),
        r.state
      ]
        .map(escapeCsvField)
        .join(",")
    );
  }
  return lines.join("\r\n");
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ServicesMultiHost() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [query, setQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const timerRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    try {
      const results = await Promise.allSettled(
        HOSTS.map(async ({ label, ip }) => {
          let lastErr = null;
          for (let attempt = 0; attempt <= RETRIES_PER_HOST; attempt++) {
            try {
              const resp = await queryHost(ip);
              const arr = extractServicesArray(resp);
              return arr.map((svc) => extractRow(label, ip, svc));
            } catch (e) {
              lastErr = e;
            }
          }
          throw new Error(`${label} (${ip}): ${lastErr?.message ?? "Error"}`);
        })
      );

      const okRows = [];
      const errs = [];
      for (const r of results) {
        if (r.status === "fulfilled") okRows.push(...r.value);
        else errs.push(String(r.reason));
      }
      setRows(okRows);
      setErrors(errs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(() => {
      loadAll();
    }, 30_000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoRefresh, loadAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.host, r.ip, r.name, r.inputUrl, r.outputs, r.state]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, query]);

  const handleExportCsv = useCallback(() => {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");
    const csv = rowsToCsv(filtered);
    downloadText(`titan_signals_${stamp}.csv`, csv);
  }, [filtered]);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: 0, marginBottom: 8 }}>Listado de señales (Titan)</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por texto (host, IP, nombre, url, estado, outputs...)"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={loadAll} disabled={loading}>
          {loading ? "Cargando..." : "Refrescar"}
        </button>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          Auto 30s
        </label>
        <button onClick={handleExportCsv} disabled={filtered.length === 0}>
          Exportar CSV
        </button>
      </div>

      {errors.length > 0 && (
        <div style={{ background: "#fff4f4", border: "1px solid #f5c2c7", padding: 8, marginBottom: 12 }}>
          <strong>Errores de conexión:</strong>
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
            {errors.map((er, i) => (
              <li key={i} style={{ whiteSpace: "pre-wrap" }}>
                {er}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ overflow: "auto", maxHeight: "75vh", border: "1px solid #ddd" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead style={{ position: "sticky", top: 0, background: "#fafafa" }}>
            <tr>
              <th style={th}>Host</th>
              <th style={th}>IP</th>
              <th style={th}>Name</th>
              <th style={th}>Input.IPInputList.Url</th>
              <th style={th}>Outputs[0].Outputs</th>
              <th style={th}>State.State</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 12, textAlign: "center", color: "#666" }}>
                  {loading ? "Cargando..." : "Sin datos para mostrar"}
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => (
                <tr key={`${r.ip}-${idx}`}>
                  <td style={td}>{r.host}</td>
                  <td style={td}>{r.ip}</td>
                  <td style={td}>{r.name}</td>
                  <td
                    style={{ ...td, whiteSpace: "nowrap", maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis" }}
                    title={r.inputUrl}
                  >
                    {r.inputUrl}
                  </td>
                  <td
                    style={{ ...td, maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis" }}
                    title={typeof r.outputs === "string" ? r.outputs : JSON.stringify(r.outputs)}
                  >
                    {typeof r.outputs === "string" ? r.outputs : JSON.stringify(r.outputs)}
                  </td>
                  <td style={td}>{r.state}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid #ddd",
  position: "sticky",
  top: 0
};

const td = {
  padding: "8px 8px",
  borderBottom: "1px solid #eee"
};
