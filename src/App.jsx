import React, { useMemo, useState } from "react";

// --- ICONOS SVG NATIVOS (Para evitar errores de librerías externas) ---
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
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  ),
};

// --- MOCK DATA & CONFIG ---

const USERS = [
  { id: "u1", name: "Laura Garcia", role: "physio", department: "Rehabilitacion", daysAvailable: 23, daysUsed: 5 },
  { id: "u2", name: "Carlos Ruiz", role: "physio", department: "Traumatologia", daysAvailable: 23, daysUsed: 12 },
  { id: "u3", name: "Ana M. Lopez", role: "physio", department: "Respiratoria", daysAvailable: 23, daysUsed: 0 },
  { id: "admin", name: "Director Gestion", role: "admin", department: "Administracion" },
];

const REQUEST_TYPES = [
  { id: "vacation", label: "Vacaciones", color: "bg-blue-100 text-blue-800" },
  { id: "medical", label: "Baja Medica", color: "bg-red-100 text-red-800" },
  { id: "personal", label: "Asuntos Propios", color: "bg-purple-100 text-purple-800" },
  { id: "training", label: "Formacion", color: "bg-green-100 text-green-800" },
];

const INITIAL_REQUESTS = [
  { id: 1, userId: "u1", userName: "Laura Garcia", type: "vacation", startDate: "2023-11-10", endDate: "2023-11-15", status: "approved", notes: "Vacaciones anuales", hasFile: false },
  { id: 2, userId: "u2", userName: "Carlos Ruiz", type: "medical", startDate: "2023-11-20", endDate: "2023-11-22", status: "pending", notes: "Gripe fuerte", hasFile: true },
  { id: 3, userId: "u3", userName: "Ana M. Lopez", type: "training", startDate: "2023-12-01", endDate: "2023-12-02", status: "rejected", notes: "Curso especializacion", hasFile: true },
];

// --- DATE HELPERS (robustos) ---

const pad2 = (n) => String(n).padStart(2, "0");

function parseISODate(iso) {
  // Espera "YYYY-MM-DD". Devuelve Date a medianoche local.
  if (!iso || typeof iso !== "string") return null;
  const [y, m, d] = iso.split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  // Validacion extra: el Date puede auto-corregir valores invalidos
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

function isInRange(dayDate, startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (!dayDate || !start || !end) return false;
  // Normaliza: dia en [start, end]
  const t = dayDate.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function daysInMonth(year, monthIndex0) {
  // monthIndex0: 0..11
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function monthNameEs(monthIndex0) {
  const names = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return names[monthIndex0] ?? "";
}

// Convierte Date -> "YYYY-MM-DD"
function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// --- UI HELPERS ---

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

// --- COMPONENTS ---

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => (
  <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50">
    <div className="p-6 border-b border-slate-700">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">F</div>
        FisioGestion
      </h1>
      <p className="text-xs text-slate-400 mt-1">Control de Ausencias</p>
    </div>

    <nav className="flex-1 p-4 space-y-2">
      {user?.role === "admin" ? (
        <>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Icons.PieChart /> Dashboard
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
            <Icons.Calendar /> Calendario Global
          </button>
        </>
      ) : (
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
          <p className="text-xs text-slate-400 capitalize">{user?.role === "admin" ? "Administrador" : "Fisioterapeuta"}</p>
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

const AdminDashboard = ({ requests, users, onGoRequests }) => {
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const activeUsers = users.filter((u) => u.role === "physio").length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>

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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Ultimas Solicitudes</h3>
          <button onClick={onGoRequests} className="text-sm text-blue-600 font-medium hover:underline">
            Ver todas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Empleado</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Fechas</th>
                <th className="px-6 py-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.slice(0, 5).map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{req.userName}</td>
                  <td className="px-6 py-4">{getTypeLabel(req.type)}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {req.startDate} - {req.endDate}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RequestsManager = ({ requests, onUpdateStatus }) => {
  const [filter, setFilter] = useState("all");

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gestion de Solicitudes</h2>
        <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {f === "all" ? "Todas" : f === "pending" ? "Pendiente" : f === "approved" ? "Aprobado" : "Rechazado"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400">No hay solicitudes en esta categoria.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-lg text-slate-800">{req.userName}</span>
                  {getTypeLabel(req.type)}
                  {getStatusBadge(req.status)}
                </div>
                <div className="text-slate-500 text-sm flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <span className="flex items-center gap-1">
                    <Icons.Calendar /> {req.startDate} a {req.endDate}
                  </span>
                  {req.hasFile && (
                    <span
                      className="flex items-center gap-1 text-blue-600 cursor-pointer hover:underline"
                      onClick={() => alert("Demo: aqui abririas/descargarias el justificante.")}
                      role="button"
                      tabIndex={0}
                    >
                      <Icons.FileText /> Ver Justificante
                    </span>
                  )}
                </div>
                {req.notes && <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg mt-2">"{req.notes}"</p>}
              </div>

              {req.status === "pending" && (
                <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                  <button
                    onClick={() => onUpdateStatus(req.id, "approved")}
                    className="flex-1 md:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => onUpdateStatus(req.id, "rejected")}
                    className="flex-1 md:flex-none px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
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
    file: null,
  });
  const [error, setError] = useState("");

  const medicalNeedsFile = formData.type === "medical";

  const handleSubmit = (e) => {
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
    if (medicalNeedsFile && !formData.file) {
      setError("Para baja medica es obligatorio adjuntar justificante.");
      return;
    }

    onSubmit({
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
      // En app real: subir a servidor y guardar URL. Aqui solo indicamos si hay archivo:
      hasFile: Boolean(formData.file),
      userId: user.id,
      userName: user.name,
    });
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
            Justificante (PDF/Imagen)
            <span className="ml-2 text-xs text-slate-400 font-normal">{medicalNeedsFile ? "Obligatorio para bajas medicas" : "Opcional"}</span>
          </label>

          {/* IMPORTANTE: relative para que el label absolute funcione si lo usas. Aqui lo hacemos mas simple: label envolviendo */}
          <label className="relative border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
            <Icons.FileText />
            <p className="text-sm mt-2">Haz clic para adjuntar archivo</p>

            <input
              type="file"
              className="hidden"
              accept="application/pdf,image/*"
              onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] ?? null })}
            />

            {formData.file && (
              <div className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center gap-2">
                <Icons.CheckCircle /> {formData.file.name}
              </div>
            )}
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Enviar Solicitud
          </button>
        </div>
      </form>
    </div>
  );
};

const UserRequests = ({ requests, user }) => {
  const myRequests = requests.filter((r) => r.userId === user.id);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Hola, {user.name}</h2>
        <p className="opacity-90 mb-6">Resumen de tus ausencias disponibles este ano.</p>

        <div className="flex gap-8 flex-wrap">
          <div>
            <p className="text-sm opacity-75 mb-1">Dias Totales</p>
            <p className="text-3xl font-bold">{user.daysAvailable}</p>
          </div>
          <div>
            <p className="text-sm opacity-75 mb-1">Disfrutados</p>
            <p className="text-3xl font-bold">{user.daysUsed}</p>
          </div>
          <div>
            <p className="text-sm opacity-75 mb-1">Pendientes</p>
            <p className="text-3xl font-bold">{user.daysAvailable - user.daysUsed}</p>
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
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
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
                <td className="px-6 py-4 text-right">
                  {req.status === "approved" && (
                    <button
                      className="text-slate-400 hover:text-slate-600"
                      onClick={() => alert("Demo: aqui exportarias/descargarias el documento.")}
                      title="Descargar"
                    >
                      <Icons.Download />
                    </button>
                  )}
                </td>
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

const CalendarView = ({ requests }) => {
  // Mes seleccionado (por defecto: Nov 2023 para que "case" con tus datos iniciales)
  const [cursor, setCursor] = useState(() => new Date(2023, 10, 1)); // 10 = noviembre

  const year = cursor.getFullYear();
  const monthIndex0 = cursor.getMonth();
  const dim = daysInMonth(year, monthIndex0);

  // Lunes=0 ... Domingo=6 (ajuste europeo)
  const firstDay = new Date(year, monthIndex0, 1);
  const firstWeekdayJs = firstDay.getDay(); // 0 domingo .. 6 sabado
  const firstWeekdayMon0 = (firstWeekdayJs + 6) % 7; // convierte a lunes=0

  const approvedRequests = useMemo(() => requests.filter((r) => r.status === "approved"), [requests]);

  const gridCells = useMemo(() => {
    const cells = [];
    // huecos iniciales
    for (let i = 0; i < firstWeekdayMon0; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(new Date(year, monthIndex0, d));
    // relleno final hasta multiplo de 7
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, monthIndex0, dim, firstWeekdayMon0]);

  const getRequestsForDate = (dateObj) => {
    if (!dateObj) return [];
    return approvedRequests.filter((r) => isInRange(dateObj, r.startDate, r.endDate));
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
            Calendario Global - {monthNameEs(monthIndex0)} {year}
          </h2>
          <p className="text-sm text-slate-500">Se muestran solo ausencias aprobadas.</p>
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
                      {r.userName.split(" ")[0]}
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

// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // null = login screen
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const physios = useMemo(() => USERS.filter((u) => u.role === "physio"), []);
  const adminUser = useMemo(() => USERS.find((u) => u.role === "admin") ?? null, []);

  const handleLogin = (role, physioId = null) => {
    if (role === "admin") {
      if (!adminUser) {
        alert("No existe usuario admin en USERS.");
        return;
      }
      setCurrentUser(adminUser);
      setActiveTab("dashboard");
      return;
    }

    // Physio: si no se pasa id, usa el primero disponible
    const chosen = physios.find((p) => p.id === physioId) ?? physios[0] ?? null;
    if (!chosen) {
      alert("No existen usuarios fisioterapeutas en USERS.");
      return;
    }
    setCurrentUser(chosen);
    setActiveTab("my-requests");
  };

  const handleCreateRequest = (newReq) => {
    const request = {
      id: Date.now(),
      status: "pending",
      hasFile: Boolean(newReq.hasFile),
      userId: newReq.userId,
      userName: newReq.userName,
      type: newReq.type,
      startDate: newReq.startDate,
      endDate: newReq.endDate,
      notes: newReq.notes,
    };

    // IMPORTANTE: updater function para no perder estado
    setRequests((prev) => [request, ...prev]);
    setActiveTab("my-requests");
  };

  const handleUpdateStatus = (id, newStatus) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Bienvenido a FisioGestion</h1>
          <p className="text-slate-500 mb-8">Selecciona un perfil para probar la demo</p>

          <div className="space-y-4">
            {/* Seleccion de fisio (opcional) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
              <p className="text-xs font-semibold text-slate-500 mb-3">Entrar como fisioterapeuta</p>
              <div className="space-y-2">
                {physios.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleLogin("physio", p.id)}
                    className="w-full p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group flex items-center justify-between"
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-800 group-hover:text-blue-700">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.department}</p>
                    </div>
                    <Icons.Users />
                  </button>
                ))}
                {physios.length === 0 && <p className="text-sm text-slate-400">No hay usuarios physio en USERS.</p>}
              </div>
            </div>

            <button
              onClick={() => handleLogin("admin")}
              className="w-full p-4 border border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group flex items-center justify-between"
            >
              <div className="text-left">
                <p className="font-bold text-slate-800 group-hover:text-purple-700">Soy Gestor/Admin</p>
                <p className="text-xs text-slate-400">Aprobar solicitudes, ver reportes...</p>
              </div>
              <Icons.PieChart />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Layout
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} onLogout={handleLogout} />

      <main className="flex-1 ml-64 p-8">
        {currentUser.role === "admin" && activeTab === "dashboard" && (
          <AdminDashboard requests={requests} users={USERS} onGoRequests={() => setActiveTab("requests")} />
        )}

        {currentUser.role === "admin" && activeTab === "requests" && (
          <RequestsManager requests={requests} onUpdateStatus={handleUpdateStatus} />
        )}

        {currentUser.role === "admin" && activeTab === "calendar" && <CalendarView requests={requests} />}

        {currentUser.role === "physio" && activeTab === "my-requests" && <UserRequests requests={requests} user={currentUser} />}

        {currentUser.role === "physio" && activeTab === "new-request" && (
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
