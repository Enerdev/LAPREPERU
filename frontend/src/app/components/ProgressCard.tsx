import { TrendingUp } from 'lucide-react';

export function ProgressCard() {
  const progress = 68;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg">Progreso del Semestre</h3>
            <p className="text-sm text-gray-500">Avance general</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {progress}%
          </p>
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Módulos</p>
          <p className="text-lg">4/4</p>
        </div>
        <div className="text-center border-x border-gray-200">
          <p className="text-sm text-gray-500">Tareas</p>
          <p className="text-lg">8/12</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Evaluaciones</p>
          <p className="text-lg">3/5</p>
        </div>
      </div>
    </div>
  );
}
