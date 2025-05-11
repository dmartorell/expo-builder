import React from 'react';
import Terminal from './Terminal';
import Form from './Form';

export default function Dashboard({ onLog, logs, setLogs }: { onLog: (log: string, processIdFromForm?: string) => void, logs: string[], setLogs: React.Dispatch<React.SetStateAction<string[]>> }) {
  return (
    <main className="grid md:grid-cols-2 gap-6 py-8 max-w-7xl mx-auto items-stretch">
      {/* Formulario */}
      <section className="bg-white rounded-xl shadow p-6 flex flex-col h-[820px] overflow-y-auto">
        <Form onLog={onLog} />
      </section>
      {/* Terminal */}
      <section className="bg-black rounded-xl shadow p-6 text-green-400 font-mono text-sm font-normal flex flex-col h-[820px] min-h-0">
        <Terminal logs={logs} setLogs={setLogs} />
      </section>
    </main>
  );
} 