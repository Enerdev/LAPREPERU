import { Calendar, Clock } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  module: string;
  dueDate: string;
  status: 'pending' | 'delivered';
}

export function TasksCard() {
  const tasks: Task[] = [
    {
      id: 1,
      title: 'Proyecto Final - Sistema de Gestión',
      module: 'Programación',
      dueDate: '20 Feb 2026',
      status: 'pending',
    },
    {
      id: 2,
      title: 'Diseño de Base de Datos Relacional',
      module: 'Base de Datos',
      dueDate: '18 Feb 2026',
      status: 'pending',
    },
    {
      id: 3,
      title: 'Configuración de Router',
      module: 'Redes',
      dueDate: '15 Feb 2026',
      status: 'delivered',
    },
    {
      id: 4,
      title: 'Sitio Web Responsivo',
      module: 'Desarrollo Web',
      dueDate: '25 Feb 2026',
      status: 'pending',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg">Tareas Pendientes</h3>
        <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
          {tasks.filter((t) => t.status === 'pending').length} pendientes
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm mb-1">{task.title}</h4>
                <p className="text-xs text-gray-500">{task.module}</p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  task.status === 'pending'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {task.status === 'pending' ? 'Pendiente' : 'Entregado'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{task.dueDate}</span>
              </div>
              {task.status === 'pending' && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Clock className="w-3 h-3" />
                  <span>Por entregar</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
