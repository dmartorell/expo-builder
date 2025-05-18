const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateApp } = require('./generator/generateApp');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty-prebuilt-multiarch');
const { updateAppConfig } = require('./generator/updateAppConfig');

const app = express();
const server = http.createServer(app);

// Configurar CORS para Express
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Configurar Socket.IO con CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io/'
});

const port = 4000;

// Configuración de multer para uploads, solo acepta PNG
const upload = multer({
  dest: path.join(__dirname, 'uploads/'),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PNG'), false);
    }
  }
});

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Almacenamiento de logs por proceso
const processLogs = {};
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Función para interceptar logs
function interceptConsoleLogs(id) {
  console.log = (...args) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    processLogs[id].logs.push(message);
    originalConsoleLog.apply(console, args);
  };
  console.error = (...args) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    processLogs[id].logs.push('❌ ' + message);
    originalConsoleError.apply(console, args);
  };
}

// Función para restaurar logs
function restoreConsoleLogs() {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}

// Almacenamiento de terminales PTY
const terminals = {};

// Manejo de conexiones Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  // Crear un proceso pty para cada cliente usando zsh
  const term = pty.spawn('zsh', ['-f'], {
    name: 'xterm-color',
    cwd: path.join(__dirname, 'generated', socket.handshake.query.appName || ''),
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      ZSH: '/bin/zsh',
      SHELL: '/bin/zsh',
      ZDOTDIR: '/tmp',
      ZSH_DISABLE_COMPFIX: 'true'
    }
  });
  
  terminals[socket.id] = term;

  // Configurar el prompt después de iniciar la terminal
  term.write('autoload -Uz colors && colors\r');
  term.write('PROMPT="%F{82}%~%f %F{white}❯%f "\r');
  term.write('clear\r');
  
  // Manejar datos del terminal
  term.onData((data) => {
    socket.emit('output', data);
  });
  
  // Manejar entrada del usuario
  socket.on('input', (data) => {
    if (terminals[socket.id]) {
      terminals[socket.id].write(data);
    }
  });
  
  // Manejar comandos específicos
  socket.on('command', (command) => {
    if (terminals[socket.id]) {
      terminals[socket.id].write(`${command}\r`);
    }
  });
  
  // Manejar redimensionamiento
  socket.on('resize', (size) => {
    if (terminals[socket.id]) {
      terminals[socket.id].resize(size.cols, size.rows);
    }
  });
  
  // Limpiar al desconectar
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    if (terminals[socket.id]) {
      terminals[socket.id].kill();
      delete terminals[socket.id];
    }
  });
});

// Función para obtener versión de manera segura
function getVersion(command) {
  try {
    return execSync(command).toString().trim();
  } catch (error) {
    return 'No instalado';
  }
}

// Endpoints
app.post('/api/generate-app', upload.fields([
  { name: 'iconIos', maxCount: 1 },
  { name: 'iconAndroid', maxCount: 1 },
  { name: 'iconNotification', maxCount: 1 },
  { name: 'iconSplash', maxCount: 1 },
]), async (req, res) => {
  try {
    const { projectName, packageName } = req.body;
    const id = uuidv4();
    processLogs[id] = { logs: [], done: false };

    // Construir iconPaths si es necesario
    const iconPaths = {
      iconIos: req.files?.iconIos?.[0]?.path,
      iconAndroid: req.files?.iconAndroid?.[0]?.path,
      iconNotification: req.files?.iconNotification?.[0]?.path,
      iconSplash: req.files?.iconSplash?.[0]?.path,
    };

    // Interceptar los logs de la consola para este proceso
    interceptConsoleLogs(id);

    // Llamar a generateApp
    generateApp({
      appName: projectName,
      packageName,
      iconPaths,
    })
      .then(() => {
        processLogs[id].done = true;
        restoreConsoleLogs();
      })
      .catch((err) => {
        const errorMsg = typeof err === 'string' ? err : (err && err.message) ? err.message : JSON.stringify(err);
        processLogs[id].done = true;
        restoreConsoleLogs();
      });

    res.json({ ok: true, id });
  } catch (error) {
    originalConsoleError('Error in /api/generate-app:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/logs/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!processLogs[id]) {
      return res.status(404).json({ ok: false, error: 'ID de proceso no encontrado' });
    }
    res.json({
      ok: true,
      logs: processLogs[id].logs,
      done: processLogs[id].done,
    });
  } catch (error) {
    originalConsoleError('Error in /api/logs/:id:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Endpoint para obtener la lista de Builds
app.get('/api/builds', (req, res) => {
  const buildsDir = path.join(__dirname, 'builds');
  const files = fs.readdirSync(buildsDir)
    .filter(file => file.endsWith('.zip'))
    .map(file => ({
      name: file.replace('.zip', ''),
      filename: file
    }));

  res.json({ builds: files });
});

// Endpoint para obtener la lista de generated apps
app.get('/api/generated-apps', (req, res) => {
  const generatedDir = path.join(__dirname, 'generated');
  
  // Verificar si existe el directorio
  if (!fs.existsSync(generatedDir)) {
    return res.json({ generatedApps: [] });
  }

  // Obtener lista de directorios
  const dirs = fs.readdirSync(generatedDir)
    .filter(file => {
      const fullPath = path.join(generatedDir, file);
      return fs.statSync(fullPath).isDirectory();
    })
    .map(dir => ({
      name: dir,
      filename: dir
    }));

  res.json({ generatedApps: dirs });
});

// Endpoint para servir archivos ZIP
app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const buildsDir = path.join(__dirname, 'builds');
    const filePath = path.join(buildsDir, filename);

    // Asegurarse de que la carpeta builds existe
    if (!fs.existsSync(buildsDir)) {
      fs.mkdirSync(buildsDir, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ error: 'File not found' });
    }

    // Obtener el tamaño del archivo
    const stat = fs.statSync(filePath);

    // Configurar headers para la descarga
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Accept-Ranges', 'bytes');

    // Manejar solicitudes de rango (para descargas parciales)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'application/zip'
      });
      
      file.pipe(res);
    } else {
      // Crear stream de lectura con un tamaño de buffer optimizado
      const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }); // 64KB chunks

      // Manejar errores del stream
      stream.on('error', (error) => {
        console.error(`Error streaming file: ${error}`);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error streaming file' });
        }
      });

      // Pipe el archivo al response
      stream.pipe(res);
    }
  } catch (error) {
    console.error(`Error in download endpoint: ${error}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Endpoint para obtener versiones del sistema
app.get('/api/system-versions', (req, res) => {
  try {
    const versions = {
      node: getVersion('node -v'),
      yarn: getVersion('yarn -v'),
      ruby: getVersion('ruby -v').split(' ')[1], // Tomamos solo la versión numérica
      cocoapods: getVersion('pod --version')
    };
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener versiones del sistema' });
  }
});

// Endpoint para iniciar la configuración de EAS
app.post('/api/start-eas-config', async (req, res) => {
  try {
    const { appName } = req.body;
    const projectPath = path.join(__dirname, 'generated', appName);
    
    // Verificar si existe el directorio
    if (!fs.existsSync(projectPath)) {
      throw new Error(`El directorio ${projectPath} no existe`);
    }

    // Verificar si el proyecto ya está configurado con EAS
    console.log('Verificando configuración de EAS...');
    try {
      // Intentar leer el archivo eas.json
      const easConfigPath = path.join(projectPath, 'eas.json');
      if (fs.existsSync(easConfigPath)) {
        console.log('El proyecto ya está configurado con EAS');
        res.json({ 
          ok: true, 
          message: 'El proyecto ya está configurado con EAS',
          configured: true 
        });
        return;
      }

      // Si no existe eas.json, proporcionar instrucciones
      console.log('El proyecto no está configurado con EAS');
      res.json({ 
        ok: true, 
        message: 'El proyecto necesita ser configurado con EAS. Por favor, ejecuta los siguientes comandos en la terminal:',
        configured: false,
        instructions: [
          `cd ${projectPath}`,
          'npx eas-cli build:configure'
        ]
      });
    } catch (error) {
      console.error('Error al verificar la configuración de EAS:', error);
      res.status(500).json({ 
        ok: false, 
        error: 'Error al verificar la configuración de EAS',
        details: error.message 
      });
    }

  } catch (error) {
    console.error('Error in /api/start-eas-config:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Endpoint para ejecutar comandos en la terminal
app.post('/api/terminal/execute', (req, res) => {
  const { command, cwd } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'No command provided' });
  }

  try {
    // Asegurarnos de que estamos en un directorio válido
    const baseDir = path.join(__dirname, 'generated');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Cambiar al directorio especificado si existe
    const originalCwd = process.cwd();
    if (cwd) {
      const targetDir = path.join(baseDir, path.basename(cwd));
      if (fs.existsSync(targetDir)) {
        process.chdir(targetDir);
      } else {
        return res.status(400).json({ error: `Directory ${targetDir} does not exist` });
      }
    } else {
      process.chdir(baseDir);
    }

    // Configurar headers para streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Crear un proceso hijo usando spawn
    const child = spawn(command, [], {
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        FORCE_COLOR: '1'
      }
    });

    let output = '';
    let error = '';

    // Manejar la salida estándar
    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      res.write(chunk);
    });

    // Manejar la salida de error
    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      error += chunk;
      res.write(chunk);
    });

    // Manejar el final del proceso
    child.on('close', (code) => {
      if (code !== 0) {
        res.write(`\nProcess exited with code ${code}\n`);
        if (error) {
          res.write(`Error: ${error}\n`);
        }
      }
      res.end();
    });

    // Manejar errores del proceso
    child.on('error', (err) => {
      res.write(`Error: ${err.message}\n`);
      res.end();
    });

  } catch (error) {
    res.write(`Error: ${error.message}\n`);
    res.end();
  }
});

// Endpoint para actualizar la configuración de la app
app.post('/api/update-app-config', async (req, res) => {
  try {
    const { appName } = req.body;
    if (!appName) {
      return res.status(400).json({ 
        success: false, 
        error: 'El nombre de la app es requerido' 
      });
    }

    const projectPath = path.join(__dirname, 'generated', appName);
    const result = updateAppConfig(projectPath);

    if (result.success) {
      res.json({
        success: true,
        details: {
          projectId: result.details.projectId,
          newAppConfigPath: result.details.newAppConfigPath,
          deletedFiles: result.details.deletedFiles
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Error al actualizar la configuración'
      });
    }
  } catch (error) {
    console.error('Error en update-app-config:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
});

// Endpoint para limpiar y crear ZIP
app.post('/api/clean-and-zip', async (req, res) => {
  try {
    const { appName } = req.body;
    if (!appName) {
      return res.status(400).json({ 
        success: false, 
        error: 'App name is required' 
      });
    }

    const projectPath = path.join(__dirname, 'generated', appName);
    const { cleanAndZip } = require('./generator/cleanAndZip');
    
    const result = await cleanAndZip(projectPath);
    
    if (result.success) {
      res.json({
        success: true,
        zipName: result.zipName
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Error creating ZIP file'
      });
    }
  } catch (error) {
    console.error('Error in clean-and-zip:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Endpoint para limpiar builds y carpetas generadas
app.post('/api/clear-builds', async (req, res) => {
  try {
    // Limpiar carpeta de builds
    const buildsPath = path.join(__dirname, 'builds');
    const files = await fs.promises.readdir(buildsPath);
    for (const file of files) {
      await fs.promises.unlink(path.join(buildsPath, file));
    }

    // Limpiar carpeta generated
    const generatedPath = path.join(__dirname, 'generated');
    const generatedDirs = await fs.promises.readdir(generatedPath);
    for (const dir of generatedDirs) {
      const dirPath = path.join(generatedPath, dir);
      const stats = await fs.promises.stat(dirPath);
      if (stats.isDirectory()) {
        await fs.promises.rm(dirPath, { recursive: true, force: true });
      }
    }

    res.json({ success: true, message: 'Builds and generated folders cleared successfully' });
  } catch (error) {
    console.error('Error clearing folders:', error);
    res.status(500).json({ success: false, error: 'Error clearing folders' });
  }
});

// Manejo de errores de multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('PNG')) {
    return res.status(400).json({ ok: false, error: err.message });
  }
  next(err);
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Error al iniciar el servidor:', err);
}); 