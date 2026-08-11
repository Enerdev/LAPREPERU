import { useState, useRef, useEffect } from "react";
import {
  Search, Users, CreditCard, MapPin, FileText, Plus, X, ChevronDown,
  Download, Eye, Edit2, Trash2, CheckCircle, Clock, AlertCircle,
  BarChart3, GraduationCap, BookOpen, TrendingUp, Menu, Bell,
  Printer, Save, ArrowLeft, Phone, Mail, Calendar, User
} from "lucide-react";
import logoImg from "@/imports/image.png";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

// ─── API ─────────────────────────────────────────────────────────────────────
// URL del backend. Si despliegas el backend en otro lado, cambia esta variable
// (o usa un .env con VITE_API_URL, ver README del frontend).
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// El backend devuelve fechas como ISO completo (2026-03-10T00:00:00.000Z).
// El frontend espera solo la parte de fecha (2026-03-10), así que normalizamos aquí.
function normalizeStudent(s: any): Student {
  return { ...s, fechaMatricula: String(s.fechaMatricula).split("T")[0] };
}
function normalizePayment(p: any): Payment {
  return {
    ...p,
    studentName: p.student ? `${p.student.nombres} ${p.student.apellidos}` : p.studentName,
    dni: p.student ? p.student.dni : p.dni,
    fecha: String(p.fecha).split("T")[0],
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "dashboard" | "estudiantes" | "matriculas" | "pagos" | "sedes";

interface Student {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  sede: string;
  ciclo: string;
  estado: "activo" | "inactivo" | "pendiente";
  fechaMatricula: string;
  pagado: boolean;
  monto: number;
  montoPagado: number;
}

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  dni: string;
  concepto: string;
  monto: number;
  fecha: string;
  estado: "pagado" | "pendiente" | "vencido";
  sede: string;
  metodoPago: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SEDES = ["Lima - Miraflores", "Lima - San Isidro", "Arequipa", "Trujillo", "Cusco", "Piura"];
const CICLOS = ["I Ciclo", "II Ciclo", "III Ciclo", "IV Ciclo", "Intensivo", "Regular"];

// Nota: estos datos ya no se usan directamente — son los mismos que se
// cargaron en la base de datos con "npm run seed" en el backend. Se dejan
// aquí solo como referencia.
const INITIAL_STUDENTS: Student[] = [
  { id: "1", dni: "74521896", nombres: "Ana María", apellidos: "Torres Quispe", email: "ana.torres@email.com", telefono: "987654321", sede: "Lima - Miraflores", ciclo: "IV Ciclo", estado: "activo", fechaMatricula: "2026-03-10", pagado: true, monto: 450, montoPagado: 450 },
  { id: "2", dni: "63218745", nombres: "Carlos Eduardo", apellidos: "Mamani Flores", email: "carlos.mamani@email.com", telefono: "976543210", sede: "Arequipa", ciclo: "II Ciclo", estado: "activo", fechaMatricula: "2026-03-12", pagado: false, monto: 380, montoPagado: 190 },
  { id: "3", dni: "89456123", nombres: "Lucía Fernanda", apellidos: "Vargas Castro", email: "lucia.vargas@email.com", telefono: "965432109", sede: "Lima - San Isidro", ciclo: "I Ciclo", estado: "pendiente", fechaMatricula: "2026-03-15", pagado: false, monto: 380, montoPagado: 0 },
  { id: "4", dni: "52174839", nombres: "Diego Alejandro", apellidos: "Huanca Puma", email: "diego.huanca@email.com", telefono: "954321098", sede: "Trujillo", ciclo: "III Ciclo", estado: "activo", fechaMatricula: "2026-02-28", pagado: true, monto: 420, montoPagado: 420 },
  { id: "5", dni: "71293846", nombres: "Valeria Sofía", apellidos: "Condori Ticona", email: "valeria.condori@email.com", telefono: "943210987", sede: "Cusco", ciclo: "Intensivo", estado: "inactivo", fechaMatricula: "2026-01-20", pagado: true, monto: 550, montoPagado: 550 },
  { id: "6", dni: "68374920", nombres: "Martín José", apellidos: "Ramos Benites", email: "martin.ramos@email.com", telefono: "932109876", sede: "Lima - Miraflores", ciclo: "II Ciclo", estado: "activo", fechaMatricula: "2026-03-18", pagado: false, monto: 380, montoPagado: 100 },
];

const INITIAL_PAYMENTS: Payment[] = [
  { id: "P001", studentId: "1", studentName: "Ana María Torres Quispe", dni: "74521896", concepto: "Mensualidad Marzo 2026", monto: 450, fecha: "2026-03-10", estado: "pagado", sede: "Lima - Miraflores", metodoPago: "Transferencia" },
  { id: "P002", studentId: "2", studentName: "Carlos Eduardo Mamani Flores", dni: "63218745", concepto: "Mensualidad Marzo 2026 (50%)", monto: 190, fecha: "2026-03-12", estado: "pagado", sede: "Arequipa", metodoPago: "Efectivo" },
  { id: "P003", studentId: "3", studentName: "Lucía Fernanda Vargas Castro", dni: "89456123", concepto: "Mensualidad Marzo 2026", monto: 380, fecha: "2026-03-15", estado: "pendiente", sede: "Lima - San Isidro", metodoPago: "-" },
  { id: "P004", studentId: "4", studentName: "Diego Alejandro Huanca Puma", dni: "52174839", concepto: "Mensualidad Febrero 2026", monto: 420, fecha: "2026-02-28", estado: "pagado", sede: "Trujillo", metodoPago: "Yape" },
  { id: "P005", studentId: "6", studentName: "Martín José Ramos Benites", dni: "68374920", concepto: "Mensualidad Marzo 2026", monto: 380, fecha: "2026-03-18", estado: "vencido", sede: "Lima - Miraflores", metodoPago: "-" },
];

// ─── Helper Components ────────────────────────────────────────────────────────
function Badge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    activo: "bg-green-100 text-green-700",
    inactivo: "bg-gray-100 text-gray-600",
    pendiente: "bg-yellow-100 text-yellow-700",
    pagado: "bg-green-100 text-green-700",
    vencido: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[estado] ?? "bg-gray-100 text-gray-600"}`}>
      {estado}
    </span>
  );
}

// ─── New Student Form ─────────────────────────────────────────────────────────
function Field({
  label, name, type = "text", placeholder = "", value, error, onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function NewStudentForm({ onClose, onSave, sedes, ciclos }: {
  onClose: () => void;
  onSave: (s: Student) => void;
  sedes: string[];
  ciclos: string[];
}) {
  const [form, setForm] = useState({
    dni: "", nombres: "", apellidos: "", email: "", telefono: "",
    sede: sedes[0], ciclo: ciclos[0], monto: "380", metodoPago: "Efectivo",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.dni || form.dni.length !== 8 || !/^\d+$/.test(form.dni)) e.dni = "DNI debe tener 8 dígitos";
    if (!form.nombres.trim()) e.nombres = "Requerido";
    if (!form.apellidos.trim()) e.apellidos = "Requerido";
    if (!form.email.includes("@")) e.email = "Email inválido";
    if (!form.telefono || form.telefono.length < 9) e.telefono = "Teléfono inválido";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const student: Student = {
      id: Date.now().toString(),
      dni: form.dni,
      nombres: form.nombres,
      apellidos: form.apellidos,
      email: form.email,
      telefono: form.telefono,
      sede: form.sede,
      ciclo: form.ciclo,
      estado: "pendiente",
      fechaMatricula: new Date().toISOString().split("T")[0],
      pagado: false,
      monto: Number(form.monto),
      montoPagado: 0,
    };
    onSave(student);
  };

  const handleFieldChange = (name: string, value: string) => {
    setForm(p => ({ ...p, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-500 rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Nuevo Estudiante</h2>
              <p className="text-red-200 text-xs">Academia Preuniversitaria La Pre Perú</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition p-1">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Datos Personales */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={14} /> Datos Personales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="DNI *" name="dni" placeholder="12345678" value={form.dni} error={errors.dni} onChange={handleFieldChange} />
              <Field label="Teléfono *" name="telefono" placeholder="987654321" value={form.telefono} error={errors.telefono} onChange={handleFieldChange} />
              <Field label="Nombres *" name="nombres" placeholder="Ana María" value={form.nombres} error={errors.nombres} onChange={handleFieldChange} />
              <Field label="Apellidos *" name="apellidos" placeholder="Torres Quispe" value={form.apellidos} error={errors.apellidos} onChange={handleFieldChange} />
              <div className="sm:col-span-2">
                <Field label="Correo Electrónico *" name="email" type="email" placeholder="estudiante@email.com" value={form.email} error={errors.email} onChange={handleFieldChange} />
              </div>
            </div>
          </div>

          {/* Datos Académicos */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen size={14} /> Datos Académicos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sede *</label>
                <div className="relative">
                  <select
                    value={form.sede}
                    onChange={e => setForm(p => ({ ...p, sede: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {sedes.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo *</label>
                <div className="relative">
                  <select
                    value={form.ciclo}
                    onChange={e => setForm(p => ({ ...p, ciclo: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {ciclos.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Datos de Pago */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard size={14} /> Datos de Pago
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto de Matrícula (S/.)</label>
                <input
                  type="number"
                  value={form.monto}
                  onChange={e => setForm(p => ({ ...p, monto: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                <div className="relative">
                  <select
                    value={form.metodoPago}
                    onChange={e => setForm(p => ({ ...p, metodoPago: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {["Efectivo", "Transferencia", "Yape", "Plin", "Tarjeta"].map(m => <option key={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700">
            Al registrar al estudiante se generará automáticamente su ficha de matrícula y podrá gestionar sus pagos desde el módulo de Pagos.
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-500 text-white text-sm font-semibold hover:from-red-800 hover:to-red-600 transition shadow-lg shadow-red-200 flex items-center gap-2">
            <Save size={15} /> Guardar Estudiante
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Matricula Print View ─────────────────────────────────────────────────────
function MatriculaView({ student, onClose }: { student: Student; onClose: () => void }) {
  const handlePrint = () => window.print();
  const handleDownloadOficial = () => {
    window.open(`${API_BASE}/students/${student.id}/ficha-matricula/pdf`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-bold text-gray-800">Ficha de Matrícula</span>
          <div className="flex gap-2">
            <button onClick={handleDownloadOficial} className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition">
              <FileText size={15} /> Ficha Oficial (PDF)
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition">
              <Printer size={15} /> Imprimir / PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition"><X size={18} /></button>
          </div>
        </div>

        {/* Printable Content */}
        <div id="matricula-print" className="p-8 print:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 border-b-2 border-red-600 pb-4">
            <div className="flex items-center gap-4">
              <img src={logoImg} alt="La Pre Perú" className="h-16 object-contain" />
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">N° Matrícula</p>
              <p className="font-bold text-lg text-red-700">MAT-{student.id.padStart(5, "0")}</p>
              <p className="text-xs text-gray-500">Fecha: {student.fechaMatricula}</p>
            </div>
          </div>

          <h2 className="text-center text-xl font-bold text-gray-800 mb-6 uppercase tracking-wide">Ficha de Matrícula</h2>

          {/* Student Data */}
          <div className="bg-gray-50 rounded-xl p-5 mb-5">
            <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-4">Datos del Estudiante</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["DNI", student.dni],
                ["Apellidos y Nombres", `${student.apellidos} ${student.nombres}`],
                ["Teléfono", student.telefono],
                ["Correo Electrónico", student.email],
                ["Sede", student.sede],
                ["Ciclo", student.ciclo],
                ["Fecha de Matrícula", student.fechaMatricula],
                ["Estado", student.estado],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-gray-400 text-xs font-medium uppercase">{label}</span>
                  <span className="text-gray-800 font-semibold mt-0.5">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Data */}
          <div className="bg-gray-50 rounded-xl p-5 mb-8">
            <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-4">Datos de Pago</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-medium uppercase">Monto Total</span>
                <span className="text-gray-800 font-bold text-lg">S/. {student.monto.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-medium uppercase">Monto Pagado</span>
                <span className="text-green-600 font-bold text-lg">S/. {student.montoPagado.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-medium uppercase">Saldo Pendiente</span>
                <span className="text-red-600 font-bold text-lg">S/. {(student.monto - student.montoPagado).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            {["Firma del Estudiante", "Firma del Apoderado", "Sello y Firma Dirección"].map(label => (
              <div key={label} className="text-center">
                <div className="border-b-2 border-gray-400 mb-2 h-12" />
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Academia Preuniversitaria La Pre Perú – R.D-2340-DREP | Ingenierías · Biomédicas · Sociales
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function Dashboard({ students, payments }: { students: Student[]; payments: Payment[] }) {
  const active = students.filter(s => s.estado === "activo").length;
  const pendingPay = payments.filter(p => p.estado === "pendiente" || p.estado === "vencido").length;
  const totalRecaudado = payments.filter(p => p.estado === "pagado").reduce((a, p) => a + p.monto, 0);

  const statCards = [
    { label: "Total Estudiantes", value: students.length, icon: Users, color: "from-red-700 to-red-500", sub: `${active} activos` },
    { label: "Matrículas Activas", value: active, icon: GraduationCap, color: "from-gray-800 to-gray-600", sub: "Este periodo" },
    { label: "Pagos Pendientes", value: pendingPay, icon: AlertCircle, color: "from-amber-600 to-amber-400", sub: "Por gestionar" },
    { label: "Total Recaudado", value: `S/. ${totalRecaudado.toLocaleString()}`, icon: TrendingUp, color: "from-green-700 to-green-500", sub: "Mes actual" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-500 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-red-200">
        <div>
          <p className="text-red-200 text-sm font-medium">Sistema de Gestión Académica</p>
          <h2 className="text-white text-2xl font-bold mt-1">Academia La Pre Perú</h2>
          <p className="text-red-100 text-sm mt-1">Ingenierías · Biomédicas · Sociales | R.D-2340-DREP</p>
        </div>
        <div className="hidden md:block opacity-20">
          <GraduationCap size={80} className="text-white" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Sedes summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={16} className="text-red-600" /> Estudiantes por Sede</h3>
          <div className="space-y-3">
            {SEDES.map(sede => {
              const count = students.filter(s => s.sede === sede).length;
              if (!count) return null;
              const pct = Math.round((count / students.length) * 100);
              return (
                <div key={sede}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{sede}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-red-700 to-red-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CreditCard size={16} className="text-red-600" /> Últimos Pagos</h3>
          <div className="space-y-3">
            {payments.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">{p.studentName.split(" ").slice(0, 2).join(" ")}</p>
                  <p className="text-xs text-gray-400">{p.concepto}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">S/. {p.monto}</p>
                  <Badge estado={p.estado} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Estudiantes Tab ──────────────────────────────────────────────────────────
function Estudiantes({ students, onAdd, onViewMatricula }: {
  students: Student[];
  onAdd: () => void;
  onViewMatricula: (s: Student) => void;
}) {
  const [query, setQuery] = useState("");
  const [filterSede, setFilterSede] = useState("Todas");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const filtered = students.filter(s => {
    const q = query.toLowerCase();
    const matchQ = !q || s.dni.includes(q) || s.nombres.toLowerCase().includes(q) || s.apellidos.toLowerCase().includes(q);
    const matchSede = filterSede === "Todas" || s.sede === filterSede;
    const matchEstado = filterEstado === "Todos" || s.estado === filterEstado;
    return matchQ && matchSede && matchEstado;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por DNI, nombres o apellidos..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
        </div>
        <div className="relative">
          <select value={filterSede} onChange={e => setFilterSede(e.target.value)} className="pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500">
            <option>Todas</option>
            {SEDES.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-3.5 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500">
            {["Todos", "activo", "inactivo", "pendiente"].map(e => <option key={e} value={e} className="capitalize">{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-3.5 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={() => {
            const params = new URLSearchParams();
            if (filterSede !== "Todas") params.set("sede", filterSede);
            if (filterEstado !== "Todos") params.set("estado", filterEstado);
            window.open(`${API_BASE}/students/export/pdf?${params.toString()}`, "_blank");
          }}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
        >
          <FileText size={16} /> Exportar PDF
        </button>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-700 to-red-500 text-white rounded-xl text-sm font-semibold hover:from-red-800 hover:to-red-600 transition shadow shadow-red-200">
          <Plus size={16} /> Nuevo Estudiante
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["DNI", "Apellidos y Nombres", "Sede", "Ciclo", "Matrícula", "Estado", "Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-700">{s.dni}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-800">{s.apellidos}</p>
                      <p className="text-gray-500 text-xs">{s.nombres}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.sede}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.ciclo}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.fechaMatricula}</td>
                  <td className="px-4 py-3"><Badge estado={s.estado} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => onViewMatricula(s)} title="Ver ficha" className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"><FileText size={15} /></button>
                      <button title="Editar" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"><Edit2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No se encontraron estudiantes</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Mostrando {filtered.length} de {students.length} estudiantes
        </div>
      </div>
    </div>
  );
}

// ─── Pagos Tab ────────────────────────────────────────────────────────────────
function Pagos({ payments, students }: { payments: Payment[]; students: Student[] }) {
  const [query, setQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const filtered = payments.filter(p => {
    const q = query.toLowerCase();
    const matchQ = !q || p.dni.includes(q) || p.studentName.toLowerCase().includes(q);
    const matchE = filterEstado === "Todos" || p.estado === filterEstado;
    return matchQ && matchE;
  });

  const totalPagado = payments.filter(p => p.estado === "pagado").reduce((a, p) => a + p.monto, 0);
  const totalPendiente = payments.filter(p => p.estado !== "pagado").reduce((a, p) => a + p.monto, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Recaudado", value: `S/. ${totalPagado.toLocaleString()}`, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
          { label: "Por Cobrar", value: `S/. ${totalPendiente.toLocaleString()}`, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
          { label: "Pagos Vencidos", value: payments.filter(p => p.estado === "vencido").length.toString(), color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border border-gray-100`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={16} className={color} />
              <span className="text-xs font-medium text-gray-500">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por DNI o nombre..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="relative">
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500">
            {["Todos", "pagado", "pendiente", "vencido"].map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-3.5 text-gray-400 pointer-events-none" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-50 transition">
          <Download size={15} /> Exportar
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-700 to-red-500 text-white rounded-xl text-sm font-semibold hover:from-red-800 hover:to-red-600 transition shadow shadow-red-200">
          <Plus size={16} /> Registrar Pago
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["N° Pago", "DNI", "Estudiante", "Concepto", "Monto", "Método", "Fecha", "Estado"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.id}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-gray-700">{p.dni}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{p.studentName}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[150px] truncate">{p.concepto}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">S/. {p.monto}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.metodoPago}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.fecha}</td>
                  <td className="px-4 py-3"><Badge estado={p.estado} /></td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No se encontraron pagos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sedes Tab ────────────────────────────────────────────────────────────────
function Sedes({ students }: { students: Student[] }) {
  const sedesData = SEDES.map(sede => ({
    nombre: sede,
    total: students.filter(s => s.sede === sede).length,
    activos: students.filter(s => s.sede === sede && s.estado === "activo").length,
    recaudado: students.filter(s => s.sede === sede).reduce((a, s) => a + s.montoPagado, 0),
  })).filter(s => s.total > 0);

  const cityMap: Record<string, string> = {
    "Lima - Miraflores": "Lima",
    "Lima - San Isidro": "Lima",
    "Arequipa": "Arequipa",
    "Trujillo": "Trujillo",
    "Cusco": "Cusco",
    "Piura": "Piura",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sedesData.map(sede => (
          <div key={sede.nombre} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center">
                  <MapPin size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{sede.nombre}</h3>
                  <p className="text-xs text-gray-400">Academia La Pre Perú</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">{cityMap[sede.nombre]}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-xl font-bold text-gray-800">{sede.total}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <div className="bg-green-50 rounded-xl p-2">
                <p className="text-xl font-bold text-green-700">{sede.activos}</p>
                <p className="text-xs text-gray-400">Activos</p>
              </div>
              <div className="bg-red-50 rounded-xl p-2">
                <p className="text-base font-bold text-red-700">S/{sede.recaudado}</p>
                <p className="text-xs text-gray-400">Recaudado</p>
              </div>
            </div>
          </div>
        ))}

        {/* Add Sede Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all min-h-[160px]">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Plus size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-400">Agregar nueva sede</p>
        </div>
      </div>
    </div>
  );
}

// ─── Matriculas Tab ───────────────────────────────────────────────────────────
function Matriculas({ students, onAdd, onViewMatricula }: {
  students: Student[];
  onAdd: () => void;
  onViewMatricula: (s: Student) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = students.filter(s => {
    const q = query.toLowerCase();
    return !q || s.dni.includes(q) || s.nombres.toLowerCase().includes(q) || s.apellidos.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar matrícula por DNI o nombre..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-700 to-red-500 text-white rounded-xl text-sm font-semibold hover:from-red-800 hover:to-red-600 transition shadow shadow-red-200">
          <Plus size={16} /> Nueva Matrícula
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {s.apellidos[0]}{s.nombres[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{s.apellidos}</p>
                  <p className="text-xs text-gray-500">{s.nombres}</p>
                </div>
              </div>
              <Badge estado={s.estado} />
            </div>
            <div className="space-y-1.5 text-xs text-gray-500 mb-4">
              <div className="flex justify-between"><span>DNI:</span><span className="font-mono font-semibold text-gray-700">{s.dni}</span></div>
              <div className="flex justify-between"><span>Sede:</span><span className="text-gray-700">{s.sede}</span></div>
              <div className="flex justify-between"><span>Ciclo:</span><span className="text-gray-700">{s.ciclo}</span></div>
              <div className="flex justify-between"><span>Fecha:</span><span className="text-gray-700">{s.fechaMatricula}</span></div>
            </div>
            {/* Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Pago</span>
                <span className="font-semibold text-gray-700">S/.{s.montoPagado} / S/.{s.monto}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div className="h-1.5 bg-gradient-to-r from-red-700 to-red-400 rounded-full" style={{ width: `${Math.round((s.montoPagado / s.monto) * 100)}%` }} />
              </div>
            </div>
            <button
              onClick={() => onViewMatricula(s)}
              className="w-full py-2 rounded-xl border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 transition flex items-center justify-center gap-1.5"
            >
              <FileText size={13} /> Ver / Imprimir Ficha
            </button>
          </div>
        ))}
        {!filtered.length && (
          <div className="col-span-3 py-16 text-center text-gray-400">No se encontraron matrículas</div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showNewStudent, setShowNewStudent] = useState(false);
  const [matriculaStudent, setMatriculaStudent] = useState<Student | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cargar alumnos y pagos reales del backend al abrir la app
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setLoadError(null);
      try {
        const [studentsRes, paymentsRes] = await Promise.all([
          fetch(`${API_BASE}/students`),
          fetch(`${API_BASE}/payments`),
        ]);
        if (!studentsRes.ok || !paymentsRes.ok) throw new Error("Respuesta no válida del servidor");
        const studentsData = await studentsRes.json();
        const paymentsData = await paymentsRes.json();
        if (!cancelled) {
          setStudents(studentsData.map(normalizeStudent));
          setPayments(paymentsData.map(normalizePayment));
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError("No se pudo conectar con el backend. Verifica que esté corriendo en " + API_BASE);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const handleSaveStudent = async (s: Student) => {
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: s.dni,
          nombres: s.nombres,
          apellidos: s.apellidos,
          email: s.email,
          telefono: s.telefono,
          sede: s.sede,
          ciclo: s.ciclo,
          monto: s.monto,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo guardar el estudiante");
      }
      const created = await res.json();
      setStudents(prev => [...prev, normalizeStudent(created)]);
      setShowNewStudent(false);
    } catch (err: any) {
      alert(err.message || "No se pudo guardar el estudiante. Verifica que el backend esté corriendo.");
    }
  };

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "estudiantes", label: "Estudiantes", icon: Users },
    { id: "matriculas", label: "Matrículas", icon: FileText },
    { id: "pagos", label: "Pagos", icon: CreditCard },
    { id: "sedes", label: "Sedes", icon: MapPin },
  ];

  const tabTitle: Record<Tab, string> = {
    dashboard: "Panel General",
    estudiantes: "Gestión de Estudiantes",
    matriculas: "Matrículas",
    pagos: "Módulo de Pagos",
    sedes: "Sedes",
  };

  return (
    <div className="min-h-screen bg-gray-100 font-[Inter,sans-serif]">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #matricula-print, #matricula-print * { visibility: visible !important; }
          #matricula-print { position: fixed; inset: 0; background: white; padding: 32px; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-[#1a1a1a] flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10">
          <img src={logoImg} alt="La Pre Perú" className="w-full object-contain max-h-16" />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">R.D-2340-DREP</p>
          <p className="text-xs text-gray-600 text-center">v1.0 · 2026</p>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Area */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-800 text-base">{tabTitle[activeTab]}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Academia Preuniversitaria La Pre Perú</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">
              <Bell size={19} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          {loadError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {loadError}
            </div>
          )}
          {loading && !loadError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
              Cargando datos del servidor...
            </div>
          )}
          {activeTab === "dashboard" && <Dashboard students={students} payments={payments} />}
          {activeTab === "estudiantes" && (
            <Estudiantes
              students={students}
              onAdd={() => setShowNewStudent(true)}
              onViewMatricula={setMatriculaStudent}
            />
          )}
          {activeTab === "matriculas" && (
            <Matriculas
              students={students}
              onAdd={() => setShowNewStudent(true)}
              onViewMatricula={setMatriculaStudent}
            />
          )}
          {activeTab === "pagos" && <Pagos payments={payments} students={students} />}
          {activeTab === "sedes" && <Sedes students={students} />}
        </main>
      </div>

      {/* Modals */}
      {showNewStudent && (
        <NewStudentForm
          onClose={() => setShowNewStudent(false)}
          onSave={handleSaveStudent}
          sedes={SEDES}
          ciclos={CICLOS}
        />
      )}
      {matriculaStudent && (
        <MatriculaView
          student={matriculaStudent}
          onClose={() => setMatriculaStudent(null)}
        />
      )}
    </div>
  );
}
