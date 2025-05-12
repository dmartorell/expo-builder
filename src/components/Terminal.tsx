import React, { useRef, useEffect } from 'react';
import TerminalLogs from './TerminalLogs';
import TerminalHeader from './TerminalHeader';
import { API_ENDPOINTS } from '../config/api';

interface TerminalLogsProps {
  logs: string[];
}

const Check = () => <span className="mr-2 text-green-500 text-2xl">✓</span>;

// Función para limpiar códigos ANSI
const cleanAnsiCodes = (text: string) => {
  return text.replace(/\[\d+m/g, '').replace(/\[39m/g, '');
};

// Paso de la terminal
interface Step {
  type: 'spinner' | 'log';
  status?: 'start' | 'success' | 'fail';
  message: string;
}

interface TerminalProps {
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Terminal({ logs, setLogs }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const versionsLoadedRef = useRef(false);

  // Efecto para auto-scroll
  useEffect(() => {
    if (containerRef.current && logs.length > 0) {
      // Usar requestAnimationFrame para asegurar que el DOM se ha actualizado
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }
  }, [logs]); // Se ejecuta cada vez que cambian los logs

  // Manejador de scroll para propagar al padre
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    // Solo hacer scroll de la página principal si hay logs y estamos cerca del final
    if (logs.length > 0) {
      const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
      if (isNearBottom) {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  // Procesa los logs en pasos
  const steps = React.useMemo(() => {
    const result: Step[] = [];
    let lastLog = ''; // Para evitar duplicados consecutivos
    
    logs.forEach((log) => {
      // Solo evitamos duplicados consecutivos
      if (log === lastLog) return;
      lastLog = log;

      // Limpiar códigos ANSI del log
      const cleanLog = cleanAnsiCodes(log);

      if (cleanLog.startsWith('SPINNER_START:')) {
        // Si hay un spinner activo, márcalo como fail (o podrías cerrarlo de otra forma)
        const lastSpinner = [...result].reverse().find(s => s.type === 'spinner' && s.status === 'start');
        if (lastSpinner) {
          lastSpinner.status = 'fail';
        }
        const newSpinner: Step = { type: 'spinner', status: 'start', message: cleanLog.replace('SPINNER_START:', '').trim() };
        result.push(newSpinner);
      } else if (cleanLog.startsWith('SPINNER_SUCCESS:')) {
        // Marca el último spinner activo como success
        const lastSpinner = [...result].reverse().find(s => s.type === 'spinner' && s.status === 'start');
        if (lastSpinner) {
          lastSpinner.status = 'success';
        }
      } else if (cleanLog.startsWith('SPINNER_FAIL:')) {
        // Marca el último spinner activo como fail
        const lastSpinner = [...result].reverse().find(s => s.type === 'spinner' && s.status === 'start');
        if (lastSpinner) {
          lastSpinner.status = 'fail';
        }
      } else {
        // Log normal
        result.push({ type: 'log', message: cleanLog });
      }
    });
    return result;
  }, [logs]);

  useEffect(() => {
    if (versionsLoadedRef.current) return;

    const fetchSystemVersions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SYSTEM_VERSIONS);
        const versions = await response.json();
        setLogs(prevLogs => {
          // Solo añadir las versiones si no están ya en los logs
          if (!prevLogs.some(log => log.includes('Versiones instaladas'))) {
            return [
              'Versiones instaladas:',
              `Node: ${versions.node}`,
              `Yarn: ${versions.yarn}`,
              `Ruby: ${versions.ruby}`,
              `CocoaPods: ${versions.cocoapods}`,
              ' ',
              ...prevLogs.map(log => log.startsWith('Versiones instaladas:') ? `text-white ${log}` : log)
            ];
          }
          return prevLogs;
        });
        versionsLoadedRef.current = true;
      } catch (error) {
        console.error('Error al obtener versiones:', error);
      }
    };

    fetchSystemVersions();
  }, [setLogs]);

  const handleClear = () => {
    setLogs([]);
  };

  return (
    <>
      <TerminalHeader onClear={handleClear} hasLogs={logs.length > 0} />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <TerminalLogs logs={logs} />
      </div>
    </>      
  );
} 