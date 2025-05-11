const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateApp } = require('./generator/generateApp');

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

app.use(cors());

// Logs por proceso
const processLogs = {};

// Función para añadir logs a un proceso
const addLog = (id, message) => {
  if (!processLogs[id]) {
    processLogs[id] = { logs: [], done: false };
  }
  processLogs[id].logs.push(message);
};

// Guardar la función original de console.log
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Función para interceptar los logs de la consola
const interceptConsoleLogs = (id) => {
  try {
    console.log = (...args) => {
      const message = args.join(' ');
      originalConsoleLog(message);
      addLog(id, message);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      originalConsoleError(message);
      addLog(id, message);
    };
  } catch (error) {
    originalConsoleError('Error intercepting console logs:', error);
  }
};

// Función para restaurar los logs originales
const restoreConsoleLogs = () => {
  try {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  } catch (error) {
    originalConsoleError('Error restoring console logs:', error);
  }
};

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

// Manejo de errores de multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('PNG')) {
    return res.status(400).json({ ok: false, error: err.message });
  }
  next(err);
});

// Error handler general
app.use((err, req, res, next) => {
  originalConsoleError('Unhandled error:', err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

app.listen(port, () => {
  originalConsoleLog(`Backend listening on http://localhost:${port}`);
}); 