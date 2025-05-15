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
    console.log(`Starting app generation: ${appName}`);
    
    // Llamar a startAppSetup con los parámetros correctos
    await startAppSetup({
      appName,
      packageName,
      iconPaths
    });

    console.log('Process completed.');
  } catch (error) {
    console.error('❌ Generation error: ' + error.message);
    throw error;
  }
}

module.exports = { generateApp }; 