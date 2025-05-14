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
}

const Terminal2: React.FC<Terminal2Props> = ({ onCommand, initialOutput, initialDir = '' }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
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
    const fitAddon = new FitAddon();
    terminalInstance.current.loadAddon(fitAddon);
    terminalInstance.current.loadAddon(new WebLinksAddon());

    // Abrir la terminal en el div de referencia
    if (terminalRef.current) {
      terminalInstance.current.open(terminalRef.current);
      fitAddon.fit();
    }

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

    // Función para manejar el redimensionamiento
    const handleResize = () => {
      fitAddon.fit();
      if (socketRef.current) {
        socketRef.current.emit('resize', {
          cols: terminalInstance.current?.cols,
          rows: terminalInstance.current?.rows
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Mostrar output inicial si existe
    if (initialOutput) {
      terminalInstance.current.write(initialOutput);
    }

    // Mostrar prompt inicial
    const dir = initialDir || '~';
    terminalInstance.current.write(`\r\n\x1b[32m${dir}\x1b[0m $ `);

    // Limpiar al desmontar
    return () => {
      if (terminalInstance.current) {
        terminalInstance.current.dispose();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [initialOutput, initialDir]);

  return (
    <div className="terminal-container bg-[#1a1a1a] rounded-lg p-4 h-[400px] w-full overflow-hidden">
      <div 
        ref={terminalRef} 
        className="h-full w-full"
        style={{ 
          minHeight: '300px',
          minWidth: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export default Terminal2; 