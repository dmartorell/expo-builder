import React from 'react';
import FormProjectConfig from './components/FormProjectConfig';
import TerminalLogs from './components/TerminalLogs';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-8 py-6 border-b bg-white flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Expo App Generator</h1>
        <nav>
          {/* Aquí puedes añadir navegación si lo necesitas */}
        </nav>
      </header>
      {/* Main layout */}
      <main className="flex flex-col md:flex-row gap-6 p-8 max-w-7xl mx-auto">
        {/* Formulario */}
        <section className="flex-1 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Configura tu proyecto</h2>
          <FormProjectConfig />
        </section>
        {/* Terminal */}
        <aside className="w-full md:w-1/2 bg-black rounded-xl shadow p-6 text-green-400 font-mono min-h-[300px]">
          <h2 className="text-lg font-semibold text-white mb-4">Terminal</h2>
          <TerminalLogs />
        </aside>
      </main>
    </div>
  );
} 