import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { Field, Form, Formik } from "formik";
import Select from "react-select";

const actionOptions = [
  { value: "", label: "Todas" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "read", label: "Read" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchLogs = async (filters = {}) => {
    try {
      setLoading(true);
      const params = { page, limit, ...filters };
      const res = await api.getAuditLogs(params);
      setLogs(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.warn("Error fetch audit:", e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  // estado local de filtros (para no resetear paginación cuando cambian)
  const [filters, setFilters] = useState({
    action: "",
    resource: "",
    userEmail: "",
    resourceId: "",
    from: "",
    to: "",
    q: "",
  });

  useEffect(() => {
    fetchLogs(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  return (
    <div className="outlet-main" style={{ padding: 16 }}>
      <h2>Auditoría de Accesos y Acciones</h2>

      <Formik
        initialValues={filters}
        enableReinitialize
        onSubmit={(vals) => {
          setPage(1);
          setFilters(vals);
          fetchLogs(vals);
        }}
      >
        {({ values, setFieldValue }) => (
          <Form
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: 8,
              alignItems: "end",
              marginBottom: 12,
            }}
          >
            <div>
              <label>Acción</label>
              <Select
                value={actionOptions.find((o) => o.value === values.action)}
                onChange={(opt) => setFieldValue("action", opt?.value || "")}
                options={actionOptions}
                placeholder="Acción"
              />
            </div>

            <div>
              <label>Recurso</label>
              <Field name="resource" className="form__input" placeholder="equipo, channel, satellite..." />
            </div>

            <div>
              <label>Usuario (email)</label>
              <Field name="userEmail" className="form__input" placeholder="usuario@dominio" />
            </div>

            <div>
              <label>Resource ID</label>
              <Field name="resourceId" className="form__input" placeholder="ObjectId o clave" />
            </div>

            <div>
              <label>Desde</label>
              <Field name="from" type="date" className="form__input" />
            </div>

            <div>
              <label>Hasta</label>
              <Field name="to" type="date" className="form__input" />
            </div>

            <div style={{ gridColumn: "span 3" }}>
              <label>Buscar</label>
              <Field name="q" className="form__input" placeholder="endpoint, userAgent, meta.query..." />
            </div>

            <div style={{ gridColumn: "span 3", textAlign: "right" }}>
              <button className="button btn-primary" type="submit">Aplicar filtros</button>
            </div>
          </Form>
        )}
      </Formik>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <div>
          <label>Límite</label>
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="form__input">
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>
            « Anterior
          </button>
          <span style={{ padding: "0 8px" }}>
            Página {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages || loading} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
            Siguiente »
          </button>
        </div>
      </div>

      <div style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={th}>Fecha</th>
              <th style={th}>Usuario</th>
              <th style={th}>Acción</th>
              <th style={th}>Recurso</th>
              <th style={th}>ResourceId</th>
              <th style={th}>Endpoint</th>
              <th style={th}>Método</th>
              <th style={th}>Status</th>
              <th style={th}>IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: 12, textAlign: "center" }}>Cargando…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 12, textAlign: "center" }}>Sin resultados</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td style={td}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{log.userEmail || "—"}</div>
                    <div style={{ color: "#6b7280", fontSize: 12 }}>{log.role || "—"}</div>
                  </td>
                  <td style={td}>{log.action}</td>
                  <td style={td}>{log.resource}</td>
                  <td style={td}>{log.resourceId || "—"}</td>
                  <td style={td}>{log.endpoint}</td>
                  <td style={td}>{log.method}</td>
                  <td style={td}>{log.statusCode}</td>
                  <td style={td}>{log.ip}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 8, color: "#6b7280" }}>
        Total: {total}
      </p>
    </div>
  );
}

const th = { padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #eee" };
const td = { padding: "8px 12px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" };