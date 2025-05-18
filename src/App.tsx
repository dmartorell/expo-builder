import { useState } from 'react';
import Documentation from './screens/DocumentationScreen';
import Layout from './components/Layout';
import { useAppLogs } from './hooks/useAppLogs';
import DashboardScreen from './screens/DashboardScreen';

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
        <DashboardScreen 
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