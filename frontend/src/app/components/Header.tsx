import { Home, BookOpen, ClipboardList, FileCheck, TrendingUp, User } from 'lucide-react';

export function Header() {
  const navItems = [
    { label: 'Inicio', icon: Home },
    { label: 'Módulos', icon: BookOpen },
    { label: 'Tareas', icon: ClipboardList },
    { label: 'Evaluaciones', icon: FileCheck },
    { label: 'Progreso', icon: TrendingUp },
    { label: 'Perfil', icon: User },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-lg">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y Título */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="6" r="1.5" fill="currentColor" />
                <circle cx="8" cy="12" r="1.5" fill="currentColor" />
                <circle cx="8" cy="18" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Informática – Cuarto Semestre
              </h1>
              <p className="text-sm text-blue-100 opacity-90">
                Aula Virtual
              </p>
            </div>
          </div>

          {/* Navegación */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
