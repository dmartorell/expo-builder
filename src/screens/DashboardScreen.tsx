import React from 'react';
import BuildsCard from '@/components/BuildsCard';
import EasCard from '@/components/EasCard';
import Terminal from '@/components/Terminal/Terminal';
import Form from '@/components/ui/Form';


interface FormData {
  projectName: string;
  packageName: string;
  iconIos: File | null;
  iconAndroid: File | null;
  iconNotification: File | null;
  iconSplash: File | null;
}

interface DashboardScreenProps {
  onLog: (log: string) => void;
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function DashboardScreen({ onLog, logs, setLogs, formData, setFormData }: DashboardScreenProps) {
  return (
    <div className="flex flex-col gap-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Columna izquierda: Formulario */}
        <div className="flex-1">
          <section className="bg-white rounded-xl shadow p-6 flex flex-col h-[820px] overflow-y-auto">
            <Form onLog={onLog} formData={formData} setFormData={setFormData} logs={logs} />
          </section>
        </div>
        {/* Terminal */}
        <section className="md:w-1/2 bg-black rounded-xl shadow p-6 text-green-400 font-mono text-sm font-normal flex flex-col h-[820px] min-h-0">
          <Terminal logs={logs} setLogs={setLogs} />
        </section>
      </div>
      {/* PreBuilds y Builds */}
      <div className="space-y-6">
        <EasCard logs={logs} />
        <BuildsCard />
      </div>
    </div>
  );
} 