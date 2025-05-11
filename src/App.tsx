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
          <main className="grid md:grid-cols-2 gap-6 py-8 max-w-7xl mx-auto items-stretch">
            {/* Formulario */}
            <section className="bg-white rounded-xl shadow p-6 flex flex-col h-[820px] overflow-y-auto">
              <FormProjectConfig onLog={handleLog} />
            </section>
            {/* Terminal */}
            <aside className="bg-black rounded-xl shadow p-6 text-green-400 font-mono text-sm font-normal flex flex-col h-[820px] min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gray-300" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="8 9 12 13 8 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="14" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Logs
                </h2>
                <button
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                  onClick={() => setLogs([])}
                  type="button"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <TerminalLogs logs={logs} />
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