// Primero necesitas instalar las dependencias:
// npm install xterm xterm-addon-fit socket.io-client

// Terminal.js - Componente de terminal React
import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import io from 'socket.io-client';
import 'xterm/css/xterm.css';
import './Terminal.css'; // Crearemos este archivo para estilos adicionales

const TerminalComponent = () => {
  const terminalRef = useRef(null);
  const terminalInstance = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Inicializar la terminal
    terminalInstance.current = new Terminal({
      cursorBlink: true,
      fontFamily: 'monospace',
      fontSize: 14,
      theme: {
        background: '#1E1E1E',
        foreground: '#F8F8F8',
      }
    });

    // Añadir el addon de fit para que la terminal se ajuste al contenedor
    const fitAddon = new FitAddon();
    terminalInstance.current.loadAddon(fitAddon);

    // Abrir la terminal en el div de referencia
    terminalInstance.current.open(terminalRef.current);
    fitAddon.fit();

    // Mostrar un prompt inicial
    terminalInstance.current.write('\r\n$ ');

    // Conectar con el backend via Socket.IO
    socketRef.current = io('http://localhost:3001'); // Ajustar URL a tu backend

    // Escuchar datos de salida del servidor
    socketRef.current.on('output', (data) => {
      terminalInstance.current.write(data);
    });

    // Manejar la entrada del usuario
    terminalInstance.current.onData((data) => {
      // Enviar lo que escribe el usuario al servidor
      socketRef.current.emit('input', data);
      
      // Mostrar lo que escribe el usuario en la terminal
      terminalInstance.current.write(data);
    });

    // Función para manejar el redimensionamiento
    const handleResize = () => {
      fitAddon.fit();
      if (socketRef.current) {
        socketRef.current.emit('resize', {
          cols: terminalInstance.current.cols,
          rows: terminalInstance.current.rows
        });
      }
    };

    window.addEventListener('resize', handleResize);

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
  }, []);

  // Función para ejecutar comando específico
  const executeCommand = (command) => {
    if (socketRef.current) {
      socketRef.current.emit('command', command);
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <span>Terminal ~ {process.env.REACT_APP_PATH || '/proyecto'}</span>
        <button onClick={() => executeCommand('npx eas-cli build:configure')}>
          Ejecutar eas-cli build:configure
        </button>
      </div>
      <div ref={terminalRef} className="terminal" />
    </div>
  );
};

export default TerminalComponent;

// Terminal.css
.terminal-container {
  width: 100%;
  height: 400px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
}

.terminal-header {
  background-color: #333;
  color: white;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.terminal {
  flex: 1;
  padding: 4px;
  background-color: #1E1E1E;
}

// Implementación básica del backend con Node.js y Socket.IO
// Archivo: server.js (ejecutar con Node.js)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const os = require('os');
const readline = require('readline');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Ajustar a la URL de tu frontend
    methods: ['GET', 'POST']
  }
});

// Configurar CORS para Express si es necesario
app.use(require('cors')());

const terminals = {};
const commands = {};

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  // Función para ejecutar comandos
  const executeCommand = (cmd, args = []) => {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    const shellArgs = os.platform() === 'win32' 
      ? ['-Command', [cmd, ...args].join(' ')] 
      : ['-c', [cmd, ...args].join(' ')];
    
    // Enviar el directorio actual como primera salida
    const cwd = process.env.HOME || process.env.USERPROFILE;
    socket.emit('output', `${cwd}$ `);
    
    const proc = spawn(shell, shellArgs, {
      cwd: cwd,
      env: process.env,
      shell: true
    });
    
    commands[socket.id] = proc;
    
    // Manejar la salida estándar
    proc.stdout.on('data', (data) => {
      socket.emit('output', data.toString());
    });
    
    // Manejar la salida de error
    proc.stderr.on('data', (data) => {
      socket.emit('output', data.toString());
    });
    
    // Crear interfaz readline para entrada
    const rl = readline.createInterface({
      input: proc.stdout,
      output: proc.stdin
    });
    
    // Cuando termine el proceso
    proc.on('close', (code) => {
      socket.emit('output', `\r\nProceso terminado con código: ${code}\r\n`);
      socket.emit('output', `${cwd}$ `);
      delete commands[socket.id];
    });
    
    return proc;
  };
  
  // Iniciar una sesión shell básica
  socket.emit('output', 'Terminal conectada\r\n');
  socket.emit('output', `${process.env.HOME || process.env.USERPROFILE}$ `);
  
  // Manejar comandos específicos
  socket.on('command', (command) => {
    if (commands[socket.id]) {
      // Si hay un comando en ejecución, intentar enviarle entrada
      commands[socket.id].stdin.write(`${command}\n`);
    } else {
      // Ejecutar nuevo comando
      executeCommand(command);
    }
  });
  
  // Manejar entrada del usuario
  socket.on('input', (data) => {
    if (commands[socket.id] && commands[socket.id].stdin.writable) {
      // Si es Enter, enviar nueva línea
      if (data === '\r' || data === '\n') {
        commands[socket.id].stdin.write('\n');
      } 
      // Para otros caracteres, simplemente enviarlos
      else {
        commands[socket.id].stdin.write(data);
      }
    }
  });
  
  // Limpiar al desconectar
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    if (commands[socket.id]) {
      commands[socket.id].kill();
      delete commands[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Para usar este backend, necesitas instalar:
// npm install express socket.io cors