import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import * as XLSX from "xlsx";
import { auth, db, provider } from "./firebase";

const ADMIN_EMAILS = ["antoniogg@iesmajuelo.com", "agongar897s@g.educaand.es"];
const JUSTIFICANTE_EMAIL = "antoniogg@iesmajuelo.com";
const DAYS_AVAILABLE = 23;

// --- ICONOS SVG NATIVOS ---
const Icons = {
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  XCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  PieChart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
  ),
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
};

const REQUEST_TYPES = [
  { id: "vacation", label: "Vacaciones", color: "bg-blue-100 text-blue-800" },
  { id: "medical", label: "Baja Medica", color: "bg-red-100 text-red-800" },
  { id: "personal", label: "Asuntos Propios", color: "bg-purple-100 text-purple-800" },
  { id: "training", label: "Formacion", color: "bg-green-100 text-green-800" },
];

const pad2 = (n) => String(n).padStart(2, "0");

function parseISODate(iso) {
  if (!iso || typeof iso !== "string") return null;
  const [y, m, d] = iso.split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

function isInRange(dayDate, startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (!dayDate || !start || !end) return false;
  const t = dayDate.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function daysInMonth(year, monthIndex0) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function monthNameEs(monthIndex0) {
  const names = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return names[monthIndex0] ?? "";
}

function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function countDaysInclusive(startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (!start || !end) return 0;
  const diffMs = end.getTime() - start.getTime();
  return diffMs >= 0 ? Math.floor(diffMs / 86400000) + 1 : 0;
}

function formatTimestamp(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase();
}

const getStatusBadge = (status) => {
  switch (status) {
    case "approved":
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
          <Icons.CheckCircle /> Aprobado
        </span>
      );
    case "rejected":
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
          <Icons.XCircle /> Rechazado
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Icons.Clock /> Pendiente
        </span>
      );
  }
};

const getTypeLabel = (typeId) => {
  const type = REQUEST_TYPES.find((t) => t.id === typeId);
  return type ? <span className={`px-2 py-1 rounded text-xs font-medium ${type.color}`}>{type.label}</span> : typeId;
};

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => (
  <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50">
    <div className="p-6 border-b border-slate-700">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">F</div>
        FisioGestor
      </h1>
      <p className="text-xs text-slate-400 mt-1">Control de Ausencias</p>
    </div>

    <nav className="flex-1 p-4 space-y-2">
      {user?.isAdmin && (
        <>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Icons.PieChart /> Resumen
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "requests" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Icons.FileText /> Solicitudes
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "calendar" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Icons.Calendar /> Calendario
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "rooms" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Icons.Users /> Salas
          </button>
          <button
            onClick={() => setActiveTab("physios")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "physios" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Icons.Users /> Fisioterapeutas
          </button>
        </>
      )}
      {user?.isPhysio && (
        <>
          <button
            onClick={() => setActiveTab("my-requests")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "my-requests" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Icons.FileText /> Mis Solicitudes
          </button>
          <button
            onClick={() => setActiveTab("new-request")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "new-request" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Icons.Plus /> Nueva Solicitud
          </button>
        </>
      )}
    </nav>

    <div className="p-4 border-t border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">
          {(user?.name?.charAt(0) ?? "U").toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium">{user?.name ?? "Usuario"}</p>
          <p className="text-xs text-slate-400 capitalize">
            {user?.isAdmin && user?.isPhysio ? "Administrador / Fisioterapeuta" : user?.isAdmin ? "Administrador" : "Fisioterapeuta"}
          </p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm transition-colors"
      >
        <Icons.LogOut /> Cerrar Sesion
      </button>
    </div>
  </div>
);

const AdminDashboard = ({ requests, physios }) => {
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const activeUsers = physios.filter((p) => p.active).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Resumen</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 mb-1">Solicitudes Pendientes</p>
              <h3 className="text-3xl font-bold text-blue-600">{pendingCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Icons.Clock />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 mb-1">Ausencias Aprobadas</p>
              <h3 className="text-3xl font-bold text-green-600">{approvedCount}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Icons.CheckCircle />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 mb-1">Fisioterapeutas Activos</p>
              <h3 className="text-3xl font-bold text-purple-600">{activeUsers}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Icons.Users />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestsTable = ({ requests, rooms, physios, onUpdateStatus }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [physioFilter, setPhysioFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const roomOptions = rooms.map((r) => ({ id: r.id, name: r.name }));
  const physioOptions = physios.map((p) => ({ id: p.email || p.id, name: p.displayName || p.email }));

  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (roomFilter !== "all" && r.roomId !== roomFilter) return false;
    if (physioFilter !== "all" && r.userEmail !== physioFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    const av = a[sortBy];
    const bv = b[sortBy];

    if (sortBy === "createdAt") {
      const ad = av?.toDate ? av.toDate().getTime() : 0;
      const bd = bv?.toDate ? bv.toDate().getTime() : 0;
      return (ad - bd) * dir;
    }

    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * dir;
    }

    return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
      return;
    }
    setSortBy(field);
    setSortDir("asc");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Estado</span>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Sala</span>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
            <option value="all">Todas</option>
            {roomOptions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Fisio</span>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={physioFilter} onChange={(e) => setPhysioFilter(e.target.value)}>
            <option value="all">Todos</option>
            {physioOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-slate-500 flex-wrap">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div> Vacaciones
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div> Baja
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div> Formacion
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div> Asuntos propios
        </span>
      </div>

      <div className="flex gap-4 text-sm text-slate-500 flex-wrap">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div> Vacaciones
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div> Baja
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div> Formacion
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div> Asuntos propios
        </span>
      </div>

      <div className="flex gap-4 text-sm text-slate-500 flex-wrap">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div> Vacaciones
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div> Baja
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div> Formacion
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div> Asuntos propios
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {[
                { key: "userName", label: "Empleado" },
                { key: "roomName", label: "Sala" },
                { key: "type", label: "Tipo" },
                { key: "startDate", label: "Inicio" },
                { key: "endDate", label: "Fin" },
                { key: "status", label: "Estado" },
                { key: "createdAt", label: "Solicitud" },
              ].map((h) => (
                <th
                  key={h.key}
                  className="px-4 py-3 font-medium cursor-pointer select-none"
                  onClick={() => toggleSort(h.key)}
                >
                  {h.label} {sortBy === h.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{req.userName}</td>
                <td className="px-4 py-3 text-slate-600">{req.roomName || "-"}</td>
                <td className="px-4 py-3">{getTypeLabel(req.type)}</td>
                <td className="px-4 py-3 text-slate-600">{req.startDate}</td>
                <td className="px-4 py-3 text-slate-600">{req.endDate}</td>
                <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                <td className="px-4 py-3 text-slate-600">{formatTimestamp(req.createdAt)}</td>
                <td className="px-4 py-3">
                  {req.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateStatus(req.id, "approved")}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => onUpdateStatus(req.id, "rejected")}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                  No hay solicitudes con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const NewRequestForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: "vacation",
    startDate: "",
    endDate: "",
    notes: "",
    declaredSent: false,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const medicalNeedsFile = formData.type === "medical";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const start = parseISODate(formData.startDate);
    const end = parseISODate(formData.endDate);

    if (!start || !end) {
      setError("Debes indicar fecha de inicio y fin.");
      return;
    }
    if (end.getTime() < start.getTime()) {
      setError("La fecha fin no puede ser anterior a la fecha inicio.");
      return;
    }
    if (medicalNeedsFile && !formData.declaredSent) {
      setError("Para baja medica debes confirmar el envio del justificante.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes,
        declaredSent: formData.declaredSent,
        userId: user.id,
        userName: user.name,
      });
    } catch (err) {
      setError(err?.message || "No se pudo enviar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Nueva Solicitud de Ausencia</h2>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Ausencia</label>
          <div className="grid grid-cols-2 gap-3">
            {REQUEST_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.id })}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  formData.type === type.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Motivo / Notas</label>
          <textarea
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-24 resize-none"
            placeholder="Describe brevemente el motivo..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Justificante
            <span className="ml-2 text-xs text-slate-400 font-normal">{medicalNeedsFile ? "Obligatorio" : "Opcional"}</span>
          </label>
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm text-slate-600 space-y-2">
            <p>
              El solicitante comunica haber remitido el justificante al correo
              <span className="font-semibold"> {JUSTIFICANTE_EMAIL}</span>.
            </p>
            <p className="text-xs text-slate-500">
              Si no se envia en el mismo dia, la solicitud sera desestimada.
            </p>
            <label className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={formData.declaredSent}
                onChange={(e) => setFormData({ ...formData, declaredSent: e.target.checked })}
              />
              <span>Confirmo que he remitido el justificante por email.</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
};

const UserRequests = ({ requests, user }) => {
  const myRequests = requests.filter((r) => r.userId === user.id);
  const approvedDays = myRequests
    .filter((r) => r.status === "approved")
    .reduce((acc, r) => acc + countDaysInclusive(r.startDate, r.endDate), 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Hola, {user.name}</h2>
        <p className="opacity-90 mb-6">Resumen de tus ausencias disponibles este ano.</p>

        <div className="flex gap-8 flex-wrap">
          <div>
            <p className="text-sm opacity-75 mb-1">Dias Totales</p>
            <p className="text-3xl font-bold">{DAYS_AVAILABLE}</p>
          </div>
          <div>
            <p className="text-sm opacity-75 mb-1">Disfrutados</p>
            <p className="text-3xl font-bold">{approvedDays}</p>
          </div>
          <div>
            <p className="text-sm opacity-75 mb-1">Pendientes</p>
            <p className="text-3xl font-bold">{Math.max(DAYS_AVAILABLE - approvedDays, 0)}</p>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-lg text-slate-800">Mis Solicitudes Recientes</h3>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Tipo</th>
              <th className="px-6 py-4 font-medium">Fechas</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium">Solicitud</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {myRequests.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4">{getTypeLabel(req.type)}</td>
                <td className="px-6 py-4 text-slate-600">
                  {req.startDate} - {req.endDate}
                </td>
                <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                <td className="px-6 py-4 text-slate-600">{formatTimestamp(req.createdAt)}</td>
              </tr>
            ))}
            {myRequests.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  No tienes solicitudes registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CalendarView = ({ requests, rooms, physios }) => {
  const [cursor, setCursor] = useState(() => new Date());
  const [statusFilter, setStatusFilter] = useState("approved");
  const [roomFilter, setRoomFilter] = useState("all");
  const [physioFilter, setPhysioFilter] = useState("all");

  const year = cursor.getFullYear();
  const monthIndex0 = cursor.getMonth();
  const dim = daysInMonth(year, monthIndex0);

  const firstDay = new Date(year, monthIndex0, 1);
  const firstWeekdayJs = firstDay.getDay();
  const firstWeekdayMon0 = (firstWeekdayJs + 6) % 7;

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (roomFilter !== "all" && r.roomId !== roomFilter) return false;
    if (physioFilter !== "all" && r.userEmail !== physioFilter) return false;
    return true;
  });

  const gridCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekdayMon0; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(new Date(year, monthIndex0, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, monthIndex0, dim, firstWeekdayMon0]);

  const getRequestsForDate = (dateObj) => {
    if (!dateObj) return [];
    return filteredRequests.filter((r) => isInRange(dateObj, r.startDate, r.endDate));
  };

  const goPrevMonth = () => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setCursor(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Calendario - {monthNameEs(monthIndex0)} {year}
          </h2>
          <p className="text-sm text-slate-500">Filtra por estado, sala o fisioterapeuta.</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goPrevMonth} className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm">
            ←
          </button>
          <button onClick={goToday} className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm">
            Hoy
          </button>
          <button onClick={goNextMonth} className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm">
            →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Estado</span>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Sala</span>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
            <option value="all">Todas</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Fisio</span>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={physioFilter} onChange={(e) => setPhysioFilter(e.target.value)}>
            <option value="all">Todos</option>
            {physios.map((p) => (
              <option key={p.id} value={p.email || p.id}>{p.displayName || p.email}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-7 gap-4 text-center mb-4">
          {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((d) => (
            <div key={d} className="font-bold text-slate-400 text-sm uppercase">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {gridCells.map((dateObj, idx) => {
            if (!dateObj) return <div key={`empty-${idx}`} />;

            const day = dateObj.getDate();
            const dayRequests = getRequestsForDate(dateObj);
            const visible = dayRequests.slice(0, 2);
            const extra = dayRequests.length - visible.length;

            return (
              <div key={toISODate(dateObj)} className="min-h-[110px] border border-slate-100 rounded-lg p-2 hover:border-blue-200 transition-colors relative">
                <span className="text-sm font-medium text-slate-400 absolute top-2 right-2">{day}</span>
                <div className="mt-6 space-y-1">
                  {visible.map((r) => (
                    <div
                      key={r.id}
                      className={`text-[10px] px-2 py-1 rounded truncate text-white ${
                        r.type === "vacation" ? "bg-blue-500" : r.type === "medical" ? "bg-red-500" : r.type === "personal" ? "bg-purple-500" : "bg-green-500"
                      }`}
                      title={`${r.userName} (${r.type})`}
                    >
                      {r.userName?.split(" ")[0] ?? ""}
                    </div>
                  ))}
                  {extra > 0 && <div className="text-[10px] text-center text-slate-400">+ {extra} mas</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RoomsManager = ({ rooms, onCreateRoom }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Debes indicar el nombre de la sala.");
      return;
    }
    try {
      await onCreateRoom(trimmed);
      setName("");
    } catch (err) {
      setError("No se pudo crear la sala.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Salas</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4 max-w-xl">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nueva sala</label>
          <input
            className="w-full px-4 py-2 border border-slate-200 rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Sala Tomares"
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Crear sala</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Sala</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((r) => (
              <tr key={r.id}>
                <td className="px-6 py-4 text-slate-700">{r.name}</td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-center text-slate-400">No hay salas creadas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PhysiosManager = ({ rooms, physios, onUpsertPhysio, onImportExcel, onToggleActive }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roomId: "",
  });
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.roomId) {
      setError("Completa nombre, apellidos, email y sala.");
      return;
    }
    try {
      await onUpsertPhysio(formData);
      setFormData({ firstName: "", lastName: "", email: "", roomId: "" });
    } catch (err) {
      setError("No se pudo guardar el fisioterapeuta.");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError("");
    try {
      await onImportExcel(file);
    } catch (err) {
      setError("No se pudo importar el Excel.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Fisioterapeutas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
              <input
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Apellidos</label>
              <input
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sala</label>
            <select
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
            >
              <option value="">Selecciona sala</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
        </form>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800">Importar Excel</h3>
          <p className="text-sm text-slate-600">
            Columnas esperadas: nombre, apellidos, email, sala.
          </p>
          <input type="file" accept=".xlsx,.xls" onChange={handleImport} disabled={importing} />
          {importing && <p className="text-sm text-slate-500">Importando...</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Sala</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {physios.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-slate-700">{p.displayName || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{p.email}</td>
                <td className="px-4 py-3 text-slate-600">{p.roomName || "-"}</td>
                <td className="px-4 py-3">{p.active ? "Activo" : "Baja"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggleActive(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${p.active ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                  >
                    {p.active ? "Dar de baja" : "Reactivar"}
                  </button>
                </td>
              </tr>
            ))}
            {physios.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No hay fisios registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [physios, setPhysios] = useState([]);
  const [authError, setAuthError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthChecking(true);
      if (!user) {
        setCurrentUser(null);
        setRequests([]);
        setActiveTab("dashboard");
        setAuthChecking(false);
        return;
      }

      const email = user.email || "";
      const isAdmin = ADMIN_EMAILS.includes(email);

      const physioQuery = query(
        collection(db, "physios"),
        where("email", "==", email),
        limit(1)
      );
      const snap = await getDocs(physioQuery);
      const physioDoc = snap.empty ? null : snap.docs[0];
      const physio = physioDoc ? { id: physioDoc.id, ...physioDoc.data() } : null;

      if (physio && physio.active === false) {
        if (isAdmin) {
          setCurrentUser({
            id: user.uid,
            email,
            name: user.displayName || email || "Administrador",
            isAdmin: true,
            isPhysio: false,
            roomId: "",
            roomName: "",
          });
          setActiveTab("dashboard");
        } else {
          setCurrentUser({
            id: user.uid,
            email,
            name: physio.displayName || user.displayName || email || "Usuario",
            role: "blocked",
            reason: "Tu cuenta esta dada de baja.",
          });
        }
        setAuthChecking(false);
        return;
      }

      if (!isAdmin && !physio) {
        setCurrentUser({
          id: user.uid,
          email,
          name: user.displayName || email || "Usuario",
          role: "blocked",
          reason: "No estas autorizado en el sistema.",
        });
        setAuthChecking(false);
        return;
      }

      setCurrentUser({
        id: user.uid,
        email,
        name: physio?.displayName || user.displayName || email || (isAdmin ? "Administrador" : "Usuario"),
        isAdmin,
        isPhysio: Boolean(physio),
        roomId: physio?.roomId || "",
        roomName: physio?.roomName || "",
      });
      setActiveTab(isAdmin ? "dashboard" : "my-requests");
      setAuthChecking(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.role === "blocked") return;

    const roomsQuery = query(collection(db, "rooms"), orderBy("name", "asc"));
    const unsubRooms = onSnapshot(roomsQuery, (snap) => {
      setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const physiosQuery = query(collection(db, "physios"), orderBy("displayName", "asc"));
    const unsubPhysios = onSnapshot(physiosQuery, (snap) => {
      setPhysios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubRooms();
      unsubPhysios();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || currentUser.role === "blocked") return;

    const base = collection(db, "requests");
    const q = currentUser.isAdmin
      ? query(base, orderBy("createdAt", "desc"))
      : query(base, where("userId", "==", currentUser.id), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRequests(data);
    });

    return () => unsub();
  }, [currentUser]);

  const handleLogin = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setAuthError(err?.message || "No se pudo iniciar sesion.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleCreateRequest = async (newReq) => {
    if (!currentUser) return;

    await addDoc(collection(db, "requests"), {
      status: "pending",
      declaredSent: Boolean(newReq.declaredSent),
      userId: newReq.userId,
      userEmail: currentUser.email || "",
      userName: newReq.userName,
      roomId: currentUser.roomId || "",
      roomName: currentUser.roomName || "",
      type: newReq.type,
      startDate: newReq.startDate,
      endDate: newReq.endDate,
      notes: newReq.notes,
      createdAt: serverTimestamp(),
    });

    setActiveTab("my-requests");
  };

  const handleUpdateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "requests", id), { status: newStatus });
  };

  const handleCreateRoom = async (name) => {
    await addDoc(collection(db, "rooms"), {
      name,
      createdAt: serverTimestamp(),
    });
  };

  const handleUpsertPhysio = async (data) => {
    const room = rooms.find((r) => r.id === data.roomId);
    const email = data.email.trim().toLowerCase();
    const displayName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
    const existing = physios.find((p) => p.email?.toLowerCase() === email);

    if (existing) {
      await updateDoc(doc(db, "physios", existing.id), {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        displayName,
        email,
        roomId: room?.id || "",
        roomName: room?.name || "",
        active: true,
        updatedAt: serverTimestamp(),
      });
      return;
    }

    await addDoc(collection(db, "physios"), {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      displayName,
      email,
      roomId: room?.id || "",
      roomName: room?.name || "",
      active: true,
      createdAt: serverTimestamp(),
    });
  };

  const handleToggleActive = async (physio) => {
    await updateDoc(doc(db, "physios", physio.id), {
      active: !physio.active,
      updatedAt: serverTimestamp(),
    });
  };

  const handleImportExcel = async (file) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const roomByName = new Map(rooms.map((r) => [r.name.toLowerCase(), r]));
    const physioByEmail = new Map(physios.map((p) => [String(p.email || "").toLowerCase(), p]));

    const batch = writeBatch(db);
    const newRooms = new Map();

    for (const row of rows) {
      const mapped = {};
      Object.keys(row).forEach((key) => {
        const normalized = normalizeHeader(key);
        mapped[normalized] = row[key];
      });

      const firstName = String(mapped.nombre || "").trim();
      const lastName = String(mapped.apellidos || "").trim();
      const email = String(mapped.email || "").trim().toLowerCase();
      const roomName = String(mapped.sala || "").trim();

      if (!email || !roomName) continue;

      let room = roomByName.get(roomName.toLowerCase()) || newRooms.get(roomName.toLowerCase());
      if (!room) {
        const ref = doc(collection(db, "rooms"));
        const payload = { name: roomName, createdAt: serverTimestamp() };
        batch.set(ref, payload);
        room = { id: ref.id, name: roomName };
        newRooms.set(roomName.toLowerCase(), room);
      }

      const displayName = `${firstName} ${lastName}`.trim();
      const existing = physioByEmail.get(email);
      if (existing) {
        batch.update(doc(db, "physios", existing.id), {
          firstName,
          lastName,
          displayName,
          email,
          roomId: room.id,
          roomName: room.name,
          active: true,
          updatedAt: serverTimestamp(),
        });
      } else {
        const ref = doc(collection(db, "physios"));
        batch.set(ref, {
          firstName,
          lastName,
          displayName,
          email,
          roomId: room.id,
          roomName: room.name,
          active: true,
          createdAt: serverTimestamp(),
        });
      }
    }

    await batch.commit();
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500">
        Cargando...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Bienvenido a FisioGestor</h1>
          <p className="text-slate-500 mb-8">Inicia sesion con Google para continuar</p>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {authError}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group flex items-center justify-center gap-3"
          >
            <Icons.Users />
            <span className="font-bold text-slate-800 group-hover:text-blue-700">Iniciar sesion con Google</span>
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.role === "blocked") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Acceso bloqueado</h1>
          <p className="text-slate-500 mb-6">{currentUser.reason || "No autorizado."}</p>
          <button
            onClick={handleLogout}
            className="w-full p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} onLogout={handleLogout} />

      <main className="flex-1 ml-64 p-8">
        {currentUser.isAdmin && !currentUser.isPhysio && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            Para solicitar ausencias, crea tu ficha de fisioterapeuta en la seccion \"Fisioterapeutas\".
          </div>
        )}
        {currentUser.isAdmin && activeTab === "dashboard" && (
          <AdminDashboard requests={requests} physios={physios} />
        )}

        {currentUser.isAdmin && activeTab === "requests" && (
          <RequestsTable requests={requests} rooms={rooms} physios={physios} onUpdateStatus={handleUpdateStatus} />
        )}

        {currentUser.isAdmin && activeTab === "calendar" && (
          <CalendarView requests={requests} rooms={rooms} physios={physios} />
        )}

        {currentUser.isAdmin && activeTab === "rooms" && (
          <RoomsManager rooms={rooms} onCreateRoom={handleCreateRoom} />
        )}

        {currentUser.isAdmin && activeTab === "physios" && (
          <PhysiosManager
            rooms={rooms}
            physios={physios}
            onUpsertPhysio={handleUpsertPhysio}
            onImportExcel={handleImportExcel}
            onToggleActive={handleToggleActive}
          />
        )}

        {currentUser.isPhysio && activeTab === "my-requests" && (
          <UserRequests
            requests={currentUser.isAdmin ? requests.filter((r) => r.userEmail === currentUser.email) : requests}
            user={currentUser}
          />
        )}

        {currentUser.isPhysio && activeTab === "new-request" && (
          <NewRequestForm
            user={currentUser}
            onSubmit={handleCreateRequest}
            onCancel={() => setActiveTab("my-requests")}
          />
        )}
      </main>
    </div>
  );
}
