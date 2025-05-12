import React from 'react';
import Terminal from './Terminal';
import Form from './Form';
import Builds from './Builds';
import PreBuilds from './PreBuilds';

interface FormData {
  projectName: string;
  packageName: string;
  iconIos: File | null;
  iconAndroid: File | null;
  iconNotification: File | null;
  iconSplash: File | null;
}

interface DashboardProps {
  onLog: (log: string, processId?: string) => void;
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function Dashboard({ onLog, logs, setLogs, formData, setFormData }: DashboardProps) {
  return (
    <main className="grid md:grid-cols-2 gap-6 py-8 max-w-7xl mx-auto items-stretch">
      {/* Columna izquierda: Formulario y Builds */}
      <div className="space-y-6">
        <section className="bg-white rounded-xl shadow p-6 flex flex-col h-[820px] overflow-y-auto">
          <Form onLog={onLog} formData={formData} setFormData={setFormData} />
        </section>
        <section>
          <PreBuilds />
        </section>
        <section>
          <Builds />
        </section>
      </div>
      {/* Terminal */}
      <section className="bg-black rounded-xl shadow p-6 text-green-400 font-mono text-sm font-normal flex flex-col h-[820px] min-h-0">
        <Terminal logs={logs} setLogs={setLogs} />
      </section>
    </main>
  );
} 