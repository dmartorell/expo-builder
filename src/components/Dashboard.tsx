import React from 'react';
import Terminal from './Terminal';
import Form from './Form';

interface FormData {
  projectName: string;
  packageName: string;
  iconIos: File | null;
  iconAndroid: File | null;
  iconNotification: File | null;
  iconSplash: File | null;
}

interface DashboardProps {
  onLog: (log: string, processIdFromForm?: string) => void;
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function Dashboard({ onLog, logs, setLogs, formData, setFormData }: DashboardProps) {
  return (
    <main className="grid md:grid-cols-2 gap-6 py-8 max-w-7xl mx-auto items-stretch">
      {/* Formulario */}
      <section className="bg-white rounded-xl shadow p-6 flex flex-col h-[820px] overflow-y-auto">
        <Form onLog={onLog} formData={formData} setFormData={setFormData} />
      </section>
      {/* Terminal */}
      <section className="bg-black rounded-xl shadow p-6 text-green-400 font-mono text-sm font-normal flex flex-col h-[820px] min-h-0">
        <Terminal logs={logs} setLogs={setLogs} />
      </section>
    </main>
  );
} 