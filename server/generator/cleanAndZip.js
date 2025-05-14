const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function cleanAndZip(projectPath) {
  try {
    // Eliminar node_modules
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log('node_modules eliminado correctamente');
    }

    // Crear carpeta builds si no existe
    const buildsDir = path.join(__dirname, '..', 'builds');
    if (!fs.existsSync(buildsDir)) {
      fs.mkdirSync(buildsDir, { recursive: true });
      console.log('Carpeta builds creada');
    }

    // Crear archivo ZIP
    const projectName = path.basename(projectPath);
    const zipPath = path.join(buildsDir, `${projectName}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Máxima compresión
    });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`Archivo ZIP creado: ${zipPath}`);
        console.log(`Tamaño total: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
        resolve({
          success: true,
          zipName: `${projectName}.zip`
        });
      });

      archive.on('error', (err) => {
        console.error('Error al crear el ZIP:', err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(projectPath, projectName);
      archive.finalize();
    });
  } catch (error) {
    console.error('Error en cleanAndZip:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { cleanAndZip }; 