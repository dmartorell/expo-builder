const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateApp } = require('./generator/generateApp');
const fs = require('fs');
const { execSync, spawn } = require('child_process');

const app = express();
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
app.use(cors());
app.use(express.json());

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
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'builds', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  res.download(filePath, filename);
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
app.post('/api/terminal/execute', async (req, res) => {
  try {
    const { command, cwd } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'No se proporcionó ningún comando' });
    }

    // Cambiar al directorio especificado si existe
    let previousDir;
    if (cwd) {
      previousDir = process.cwd();
      process.chdir(cwd);
    }

    // Ejecutar el comando
    const output = execSync(command, { encoding: 'utf8' });

    // Restaurar el directorio anterior si cambiamos
    if (previousDir) {
      process.chdir(previousDir);
    }

    res.json({ output });
  } catch (error) {
    console.error('Error al ejecutar comando:', error);
    res.status(500).json({ 
      error: 'Error al ejecutar el comando',
      details: error.message,
      output: error.stdout || error.stderr
    });
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
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Error al iniciar el servidor:', err);
}); 