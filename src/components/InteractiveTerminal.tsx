import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import io from 'socket.io-client';
import 'xterm/css/xterm.css';

interface InteractiveTerminalProps {
  onCommand?: (command: string) => Promise<string>;
  initialOutput?: string;
  initialDir?: string;
  initialCommand?: string;
}

const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({ initialOutput, initialDir = '', initialCommand }) => {
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
      withCredentials: true,
      query: {
        appName: initialDir.split('/').pop()
      }
    });

    // Escuchar datos de salida del servidor
    socketRef.current.on('output', (data: string) => {
      terminalInstance.current?.write(data);
    });

    // Manejar la entrada del usuario
    terminalInstance.current.onData((data) => {
      socketRef.current?.emit('input', data);
    });

    // Mostrar output inicial si existe
    if (initialOutput) {
      terminalInstance.current.write(initialOutput);
    }

    // Mostrar el path actual
    const currentPath = initialDir || '~';
    terminalInstance.current.write(`\r\n\x1b[32m${currentPath}\x1b[0m \x1b[34m❯\x1b[0m `);

    // Ejecutar comando inicial si existe
    if (initialCommand) {
      terminalInstance.current.write('\r\nComprobando versión de eas-cli...\r\n');
      
      socketRef.current?.emit('command', 'npm list -g eas-cli');
      
      let easCliInstalled = false;
      let easConfigCompleted = false;
      let configOutput = '';
      let commandExecuted = false;

      socketRef.current?.on('output', (data: string) => {
        configOutput += data;
        
        if (data.includes('eas-cli@') && !commandExecuted) {
          commandExecuted = true;
          easCliInstalled = true;
          terminalInstance.current?.write('\r\nEas-cli ya está instalado. Procediendo con la configuración...\r\n');
          socketRef.current?.emit('command', 'npx eas-cli build:configure');
        } else if (data.includes('empty') && !easCliInstalled && !commandExecuted) {
          commandExecuted = true;
          terminalInstance.current?.write('\r\nInstalando eas-cli globalmente...\r\n');
          socketRef.current?.emit('command', 'npm install --global eas-cli');
          
          setTimeout(() => {
            terminalInstance.current?.write('\r\nConfigurando Eas Project...\r\n');
            socketRef.current?.emit('command', 'npx eas-cli build:configure');
          }, 2000);
        }

        if (data.includes('Your project is ready to build')) {
          if (!easConfigCompleted) {
            easConfigCompleted = true;
            setTimeout(() => {
              terminalInstance.current?.write('\r\nDo you want to proceed with project cleanup and packaging? (Y/n): ');
              
              const handleUserInput = (input: string) => {
                const cleanInput = input.trim().toLowerCase();
                
                if (cleanInput === '' || cleanInput === 'y') {
                  terminalInstance.current?.write('\r\nUpdating configuration...\r\n');
                  
                  fetch('http://localhost:4000/api/update-app-config', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      appName: initialDir.split('/').pop()
                    }),
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                  })
                  .then(data => {
                    if (data.success) {
                      terminalInstance.current?.write('\r\n✅ Configuration updated successfully\r\n');
                      if (data.details?.projectId) {
                        terminalInstance.current?.write(`\r\nProjectId: ${data.details.projectId}\r\n`);
                      }
                      terminalInstance.current?.write(`\r\nUpdated files:\r\n`);
                      terminalInstance.current?.write(`- app.config.ts moved to root\r\n`);
                      terminalInstance.current?.write(`- app.json removed\r\n`);
                      terminalInstance.current?.write(`- app.config.ts removed from config folder\r\n`);
                      
                      // Mostrar spinner y mensaje de inicio del proceso
                      terminalInstance.current?.write('\r\n');
                      // Ocultar el cursor
                      terminalInstance.current?.write('\x1b[?25l');
                      
                      let spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
                      let spinnerIndex = 0;
                      const spinnerInterval = setInterval(() => {
                        if (terminalInstance.current) {
                          // Borrar la línea anterior
                          terminalInstance.current.write('\x1b[1A\x1b[2K');
                          terminalInstance.current.write(`${spinnerChars[spinnerIndex]} Processing\r\n`);
                          spinnerIndex = (spinnerIndex + 1) % spinnerChars.length;
                        }
                      }, 80);

                      // Eliminar node_modules y crear ZIP
                      fetch('http://localhost:4000/api/clean-and-zip', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          appName: initialDir.split('/').pop()
                        }),
                      })
                      .then(response => response.json())
                      .then(data => {
                        // Detener el spinner
                        clearInterval(spinnerInterval);
                        // Borrar la última línea del spinner
                        terminalInstance.current?.write('\x1b[1A\x1b[2K');
                        
                        if (data.success) {
                          terminalInstance.current?.write(`\r\n✅ node_modules removed\r\n`);
                          terminalInstance.current?.write(`✅ Project saved as ZIP in builds/${data.zipName}\r\n`);
                          // Disparar evento de nuevo build
                          window.dispatchEvent(new Event('new-build-created'));
                        } else {
                          throw new Error(data.error || 'Error desconocido');
                        }
                      })
                      .catch(error => {
                        // Detener el spinner en caso de error
                        clearInterval(spinnerInterval);
                        // Borrar la última línea del spinner
                        terminalInstance.current?.write('\x1b[1A\x1b[2K');
                        
                        console.error('Error:', error);
                        terminalInstance.current?.write(`\r\n❌ Error: ${error.message}\r\n`);
                      });
                    } else {
                      throw new Error(data.error || 'Error desconocido');
                    }
                  })
                  .catch(error => {
                    console.error('Error:', error);
                    terminalInstance.current?.write(`\r\n❌ Error: ${error.message}\r\n`);
                  });
                } else {
                  terminalInstance.current?.write('\r\nOperación cancelada por el usuario\r\n');
                  
                  if (socketRef.current) {
                    socketRef.current.disconnect();
                  }
                  if (terminalInstance.current) {
                    terminalInstance.current.options.disableStdin = true;
                    terminalInstance.current.options.cursorBlink = false;
                    terminalInstance.current.write('\x1b[?25l');
                  }
                }
                
                const disposable = terminalInstance.current?.onData(handleUserInput);
                disposable?.dispose();
              };
              
              terminalInstance.current?.onData(handleUserInput);
            }, 1000);
          }
        }
      });
    }

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

export default InteractiveTerminal; 