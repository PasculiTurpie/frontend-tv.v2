// src/pages/ChannelDiagram/ChannelDiagram.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../utils/api";
import CustomNode from "./CustomNode";
import RouterNode from "./RouterNode";
import CustomDirectionalEdge from "./CustomDirectionalEdge";
import CustomWaypointEdge from "./CustomWaypointEdge";
import "./ChannelDiagram.css";

/* ───────────────────────── utils/const ───────────────────────── */

const ARROW_CLOSED = { type: 1 };
const SAME_X_EPS = 8;

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

const toId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return String(value._id);
  if (typeof value === "object" && value.id) return String(value.id);
  return null;
};

const mapNodeFromApi = (node) => {
  if (!node) return null;
  const id = node.id ?? node._id ?? node.key;
  if (!id) return null;

  const rawData = node.data || {};
  const rawEquipo = node.equipo || node.equipment || {};
  const equipoId =
    rawData.equipoId ??
    node.equipoId ??
    (typeof rawEquipo === "object"
      ? rawEquipo?._id || rawEquipo?.id || rawEquipo?.value
      : rawEquipo);
  const equipoNombre =
    rawData.equipoNombre ??
    node.equipoNombre ??
    (typeof rawEquipo === "object" ? rawEquipo?.nombre : null);
  const equipoTipo =
    rawData.equipoTipo ??
    node.equipoTipo ??
    (typeof rawEquipo === "object" ? tipoToKey(rawEquipo?.t
