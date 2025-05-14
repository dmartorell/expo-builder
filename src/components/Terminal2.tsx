import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import io from 'socket.io-client';
import 'xterm/css/xterm.css';

interface Terminal2Props {
  onCommand?: (command: string) => Promise<string>;
  initialOutput?: string;
  initialDir?: string;
  initialCommand?: string;
}

const Terminal2: React.FC<Terminal2Props> = ({ onCommand, initialOutput, initialDir = '', initialCommand }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const socketRef = useRef<any>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Inicializar la terminal
    terminalInstance.current = new Terminal({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#1a1a1a',
        foreground: '#ffffff',
      },
      rows: 24,
      cols: 80,
      convertEol: true,
    });

    // Añadir addons
    fitAddonRef.current = new FitAddon();
    terminalInstance.current.loadAddon(fitAddonRef.current);
    terminalInstance.current.loadAddon(new WebLinksAddon());

    // Abrir la terminal en el div de referencia
    terminalInstance.current.open(terminalRef.current);

    // Configurar ResizeObserver para manejar cambios de tamaño
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
        if (socketRef.current) {
          socketRef.current.emit('resize', {
            cols: terminalInstance.current?.cols,
            rows: terminalInstance.current?.rows
          });
        }
      }
    });

    resizeObserver.observe(terminalRef.current);

    // Conectar con el backend via Socket.IO
    socketRef.current = io('http://localhost:4000', {
      path: '/socket.io/',
      withCredentials: true
    });

    // Escuchar datos de salida del servidor
    socketRef.current.on('output', (data: string) => {
      terminalInstance.current?.write(data);
    });

    // Manejar la entrada del usuario
    terminalInstance.current.onData((data) => {
      // Enviar lo que escribe el usuario al servidor
      socketRef.current?.emit('input', data);
    });

    // Mostrar output inicial si existe
    if (initialOutput) {
      terminalInstance.current.write(initialOutput);
    }

    // Ejecutar comando inicial si existe
    if (initialCommand) {
      socketRef.current?.emit('command', initialCommand);
    }

    // Limpiar al desmontar
    return () => {
      resizeObserver.disconnect();
      if (terminalInstance.current) {
        terminalInstance.current.dispose();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [initialOutput, initialDir, initialCommand]);

  return (
    <div className="terminal-container bg-[#1a1a1a] rounded-lg p-4 h-[400px] w-full">
      <div 
        ref={terminalRef} 
        className="h-full w-full"
        style={{ 
          height: '100%',
          width: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '8px'
        }}
      />
    </div>
  );
};

export default Terminal2; 