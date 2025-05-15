const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function cleanAndZip(projectPath) {
  try {
    // Verificar que el directorio del proyecto existe
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project directory does not exist: ${projectPath}`);
    }

    // Eliminar node_modules
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log('node_modules removed successfully');
    }

    // Crear carpeta builds si no existe
    const buildsDir = path.join(__dirname, '..', 'builds');
    if (!fs.existsSync(buildsDir)) {
      fs.mkdirSync(buildsDir, { recursive: true });
      console.log('Builds directory created');
    }

    // Crear archivo ZIP
    const projectName = path.basename(projectPath);
    const zipPath = path.join(buildsDir, `${projectName}.zip`);
    
    // Si el archivo ZIP ya existe, eliminarlo
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
      console.log('Existing ZIP file removed');
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Máxima compresión
    });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        // Verificar que el archivo se creó correctamente
        if (fs.existsSync(zipPath)) {
          const stats = fs.statSync(zipPath);
          console.log(`ZIP file created: ${zipPath}`);
          console.log(`Total size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
          resolve({
            success: true,
            zipName: `${projectName}.zip`
          });
        } else {
          reject(new Error('ZIP file was not created'));
        }
      });

      output.on('error', (err) => {
        console.error('Error in output stream:', err);
        reject(err);
      });

      archive.on('error', (err) => {
        console.error('Error in archive:', err);
        reject(err);
      });

      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('Archive warning:', err);
        } else {
          reject(err);
        }
      });

      archive.pipe(output);
      
      // Agregar el directorio al archivo ZIP
      archive.directory(projectPath, projectName);
      
      // Finalizar el archivo
      archive.finalize();
    });
  } catch (error) {
    console.error('Error in cleanAndZip:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { cleanAndZip }; 