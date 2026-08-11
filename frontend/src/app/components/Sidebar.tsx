import {
  LayoutDashboard,
  GraduationCap,
  FolderOpen,
  MessageSquare,
  FolderKanban,
  Award,
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const [activeSection, setActiveSection] = useState('Dashboard');

  const sections = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Clases', icon: GraduationCap },
    { name: 'Recursos', icon: FolderOpen },
    { name: 'Foros', icon: MessageSquare },
    { name: 'Proyectos', icon: FolderKanban },
    { name: 'Calificaciones', icon: Award },
  ];

  return (
    <aside className="bg-white w-64 min-h-screen border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
          Navegación
        </h2>
        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.name;
            return (
              <button
                key={section.name}
                onClick={() => setActiveSection(section.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{section.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
