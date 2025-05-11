import React, { useState, useRef, useEffect } from 'react';
import FormProjectConfig from './components/FormProjectConfig';
import TerminalLogs from './components/TerminalLogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [processId, setProcessId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastLogCountRef = useRef<number>(0);

  const handleLog = (log: string, processIdFromForm?: string) => {
    setLogs(prev => [...prev, log]);
    if (processIdFromForm) {
      setProcessId(processIdFromForm);
      startPolling(processIdFromForm);
    }
  };

  const startPolling = (id: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    lastLogCountRef.current = 0;
    pollingRef.current = setInterval(async () => {
      const res = await fetch(`http://localhost:4000/api/logs/${id}`);
      const data = await res.json();
      if (data.ok) {
        // Solo añadir los nuevos logs
        if (data.logs.length > lastLogCountRef.current) {
          const newLogs = data.logs.slice(lastLogCountRef.current);
          setLogs(prev => [...prev, ...newLogs]);
          lastLogCountRef.current = data.logs.length;
        }
        if (data.done) {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
        }
      }
    }, 1000);
  };

  const handleClearLogs = () => {
    setLogs([]);
    setProcessId(null);
    lastLogCountRef.current = 0;
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // Limpiar el intervalo cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-8 py-6 border-b bg-white flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Expo App Generator</h1>
        <nav>
          {/* Aquí puedes añadir navegación si lo necesitas */}
        </nav>
      </header>
      {/* Tabs */}
      <Tabs defaultValue="board" className="px-8 pt-6">
        <div className="flex justify-end">
          <TabsList className="flex gap-2 bg-transparent p-0 border-none shadow-none">
            <TabsTrigger
              value="board"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:shadow-none rounded-full px-6 py-2 text-base text-gray-500 font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 bg-transparent border-none shadow-none"
            >
              Board
            </TabsTrigger>
            <TabsTrigger
              value="documentation"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:shadow-none rounded-full px-6 py-2 text-base text-gray-500 font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 bg-transparent border-none shadow-none"
            >
              Documentation
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="board">
          {/* Main layout */}
          <main className="flex flex-col md:flex-row gap-6 p-8 max-w-7xl mx-auto">
            {/* Formulario */}
            <section className="flex-1 bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Configura tu proyecto</h2>
              <FormProjectConfig onLog={handleLog} />
            </section>
            {/* Terminal */}
            <aside className="w-full md:w-1/2 bg-black rounded-xl shadow p-6 text-green-400 font-mono text-sm font-normal min-h-[300px] flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-4">Logs</h2>
              <div className="flex-1 overflow-y-auto">
                <TerminalLogs logs={logs} onClearLogs={handleClearLogs} />
              </div>
            </aside>
          </main>
        </TabsContent>
        <TabsContent value="documentation">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Documentation</h2>
            <p className="text-gray-600">Documentation content will go here...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 