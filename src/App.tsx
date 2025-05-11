import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';
import Layout from './components/Layout';
import { useAppLogs } from './hooks/useAppLogs';

export default function App() {
  const { logs, setLogs, handleLog } = useAppLogs();

  return (
    <Layout
      dashboardContent={<Dashboard onLog={handleLog} logs={logs} setLogs={setLogs} />}
      documentationContent={<Documentation />}
      defaultTab="dashboard"
    />
  );
} 