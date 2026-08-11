import { Sparkles } from 'lucide-react';

export function WelcomeCard() {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl">Bienvenido al Aula Virtual</h2>
          </div>
          <p className="text-blue-100 mt-2 max-w-2xl">
            Explora tus módulos, completa tus tareas y mantente al día con tu progreso académico.
            Este semestre aprenderás las bases fundamentales de la informática.
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
          <p className="text-xs text-blue-100">Periodo</p>
          <p className="text-sm">2026-1</p>
        </div>
      </div>
    </div>
  );
}
