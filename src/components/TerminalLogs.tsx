import React, { useRef, useEffect } from 'react';
import { Loader2 } from "lucide-react";

interface TerminalLogsProps {
  logs: string[];
}

const Check = () => <span className="mr-2 text-green-500 text-2xl">✓</span>;

// Paso de la terminal
interface Step {
  type: 'spinner' | 'log';
  status?: 'start' | 'success' | 'fail';
  message: string;
}

export default function TerminalLogs({ logs }: TerminalLogsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Efecto para auto-scroll
  useEffect(() => {
    const scrollToBottom = () => {
      if (containerRef.current && logs.length > 0) {
        const container = containerRef.current;
        
        // Solo hacer scroll del contenedor hijo
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    };

    // Ejecutar inmediatamente
    scrollToBottom();
    
    // Y también después de un pequeño retraso para asegurar que el contenido se haya renderizado
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [logs]);

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

      if (log.startsWith('SPINNER_START:')) {
        // Si hay un spinner activo, márcalo como fail (o podrías cerrarlo de otra forma)
        const lastSpinner = [...result].reverse().find(s => s.type === 'spinner' && s.status === 'start');
        if (lastSpinner) {
          console.log('Found active spinner, marking as fail:', lastSpinner); // Debug log
          lastSpinner.status = 'fail';
        }
        const newSpinner: Step = { type: 'spinner', status: 'start', message: log.replace('SPINNER_START:', '').trim() };
        console.log('Creating new spinner:', newSpinner); // Debug log
        result.push(newSpinner);
      } else if (log.startsWith('SPINNER_SUCCESS:')) {
        // Marca el último spinner activo como success
        const lastSpinner = [...result].reverse().find(s => s.type === 'spinner' && s.status === 'start');
        if (lastSpinner) {
          console.log('Marking spinner as success:', lastSpinner); // Debug log
          lastSpinner.status = 'success';
        }
      } else if (log.startsWith('SPINNER_FAIL:')) {
        // Marca el último spinner activo como fail
        const lastSpinner = [...result].reverse().find(s => s.type === 'spinner' && s.status === 'start');
        if (lastSpinner) lastSpinner.status = 'fail';
      } else {
        // Log normal
        result.push({ type: 'log', message: log });
      }
    });
    return result;
  }, [logs]);

  return (
    <div className="h-full flex flex-col">
      <div 
        ref={containerRef} 
        onScroll={handleScroll}
        className="flex-1 whitespace-pre-wrap break-words font-mono text-sm space-y-1 overflow-y-auto
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {steps.length === 0 ? (
          ""
        ) : (
          steps.map((step, i) => {
            if (step.type === 'spinner') {
              if (step.status === 'start') {
                return <div key={i} className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin text-green-400" />{step.message}</div>;
              }
              if (step.status === 'success') {
                return <div key={i} className="flex items-center"><Check />{step.message}</div>;
              }
              // Si es fail, no mostrar icono, solo el mensaje en rojo
              if (step.status === 'fail') {
                return <div key={i} className="flex items-center text-red-400">{step.message}</div>;
              }
            }
            // Log de error: si empieza por 'Error en la generación:' o '❌', mostrar en rojo
            if (step.message.startsWith('Error en la generación:') || step.message.startsWith('❌')) {
              return <div key={i} className="flex items-center text-red-400"><span className="mr-2 text-2xl">✕</span>{step.message.replace('❌', '').trim()}</div>;
            }
            // Log normal
            return <div key={i}>{step.message}</div>;
          })
        )}
      </div>
    </div>
  );
} 