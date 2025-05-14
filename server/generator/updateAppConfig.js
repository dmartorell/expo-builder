const fs = require('fs');
const path = require('path');

function updateAppConfig(projectPath) {
  try {
    // Leer el app.json
    const appJsonPath = path.join(projectPath, 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Obtener el projectId
    const projectId = appJson?.expo?.extra?.eas?.projectId;
    
    if (!projectId) {
      throw new Error('No se encontró el projectId en app.json');
    }

    // Leer el app.config.ts
    const appConfigPath = path.join(projectPath, 'config', 'app.config.ts');
    const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');

    // Actualizar el projectId en app.config.ts
    const updatedContent = appConfigContent.replace(
      /projectId:\s*['"][^'"]*['"]/,
      `projectId: '${projectId}'`
    );

    // Guardar el archivo actualizado
    fs.writeFileSync(appConfigPath, updatedContent);

    // Mover app.config.ts a la raíz
    const newAppConfigPath = path.join(projectPath, 'app.config.ts');
    fs.copyFileSync(appConfigPath, newAppConfigPath);

    // Eliminar el archivo original de config
    fs.unlinkSync(appConfigPath);

    // Eliminar app.json
    fs.unlinkSync(appJsonPath);

    // Eliminar la carpeta config si está vacía
    const configDir = path.join(projectPath, 'config');
    if (fs.existsSync(configDir)) {
      const files = fs.readdirSync(configDir);
      if (files.length === 0) {
        fs.rmdirSync(configDir);
      }
    }

    // Verificar que los cambios se realizaron correctamente
    if (!fs.existsSync(newAppConfigPath)) {
      throw new Error('Error al mover app.config.ts a la raíz');
    }

    if (fs.existsSync(appJsonPath)) {
      throw new Error('Error al eliminar app.json');
    }

    if (fs.existsSync(appConfigPath)) {
      throw new Error('Error al eliminar app.config.ts de la carpeta config');
    }

    return {
      success: true,
      message: 'Configuración actualizada correctamente',
      details: {
        projectId,
        newAppConfigPath,
        deletedFiles: [appJsonPath, appConfigPath]
      }
    };
  } catch (error) {
    console.error('Error actualizando la configuración:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { updateAppConfig }; 