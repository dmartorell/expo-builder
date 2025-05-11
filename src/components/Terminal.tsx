import React, { useRef, useEffect } from 'react';
import TerminalLogs from './TerminalLogs';
import TerminalHeader from './TerminalHeader';

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

  return (
    <>
      <TerminalHeader onClear={() => setLogs([])} hasLogs={logs.length > 0} />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <TerminalLogs logs={logs} />
      </div>
    </>      
  );
} 