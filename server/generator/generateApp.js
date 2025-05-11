const { startAppSetup } = require('./startAppSetup');

/**
 * Genera una app Expo usando los datos recibidos
 * @param {Object} options
 * @param {string} options.appName
 * @param {string} options.packageName
 * @param {Object} options.iconPaths
 */
async function generateApp({ appName, packageName, iconPaths = {} }) {
  try {
    console.log(`Iniciando generación de la app: ${appName}`);
    
    // Llamar a startAppSetup con los parámetros correctos
    await startAppSetup({
      appName,
      packageName,
      iconPaths
    });

    console.log('🎉 Proceso finalizado.');
  } catch (error) {
    console.error('❌ Error en la generación: ' + error.message);
    throw error;
  }
}

module.exports = { generateApp }; 