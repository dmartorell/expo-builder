import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';
import Layout from './components/Layout';
import { useAppLogs } from './hooks/useAppLogs';

interface FormData {
  projectName: string;
  packageName: string;
  iconIos: File | null;
  iconAndroid: File | null;
  iconNotification: File | null;
  iconSplash: File | null;
}

const initialFormData: FormData = {
  projectName: '',
  packageName: '',
  iconIos: null,
  iconAndroid: null,
  iconNotification: null,
  iconSplash: null,
};

export default function App() {
  const { logs, setLogs, handleLog } = useAppLogs();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  return (
    <Layout
      dashboardContent={
        <Dashboard 
          onLog={handleLog} 
          logs={logs} 
          setLogs={setLogs} 
          formData={formData}
          setFormData={setFormData}
        />
      }
      documentationContent={<Documentation />}
      defaultTab="dashboard"
    />
  );
} 