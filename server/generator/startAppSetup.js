// const chalk = require('chalk');
const { createVsCodeSettings } = require('./vsCodeConfig');
const {
  executeCommand,
  isValidPackageName,
  removeFieldsFromPackageJson,
  addAndCommitChanges,
} = require('./utils');
const {
  copyFilesToProject,
  updateTsConfig,
  updatePackageJson,
  updateAppJson,
  copyAndModifyAppConfig,
  replaceGitIgnore,
  updateAppTsx,
  addEasIgnore,
} = require('./modifyProjectFiles');

/**
 * Genera una app Expo usando los datos recibidos
 * @param {Object} options
 * @param {string} options.appName
 * @param {string} options.packageName
 * @param {Object} options.iconPaths
 */
async function startAppSetup({ appName, packageName, iconPaths = {} }) {
  try {
    console.log(`Iniciando generación de la app: ${appName}`);
    if (!isValidPackageName(packageName)) {
      throw new Error('El package name no es válido. Debe tener formato reverse domain.');
    }
    const parsedAppName = appName.toLowerCase().replace(/\s/g, '-');
    const projectPath = `generated/${parsedAppName}`;

    await executeCommand(
      `yarn create expo-app ${projectPath} --template expo-template-blank-typescript`,
      `Generando proyecto Expo ${parsedAppName}...`,
      'Proyecto creado correctamente.',
      null,
      '.'
    );

    updateAppJson(projectPath, parsedAppName, packageName);
    removeFieldsFromPackageJson(projectPath);
    createVsCodeSettings(projectPath);
    copyAndModifyAppConfig(projectPath, {
      name: parsedAppName,
      slug: parsedAppName,
      scheme: parsedAppName,
      package: packageName,
      bundleIdentifier: packageName,
    });
    updatePackageJson(projectPath);
    replaceGitIgnore(projectPath);
    addEasIgnore(projectPath);
    updateAppTsx(projectPath);
    updateTsConfig(projectPath);
    copyFilesToProject(projectPath);

    await executeCommand(
      `yarn install --cwd ${projectPath}`,
      'Instalando dependencias...',
      'Dependencias instaladas.',
      null,
      '.'
    );
    await executeCommand(
      `cd ${projectPath} && npx expo prebuild`,
      'Ejecutando prebuild...',
      'Prebuild completado.',
      null,
      '.'
    );
    await addAndCommitChanges(projectPath);
    console.log('Proceso finalizado.');
  } catch (error) {
    console.error('❌ Error en la generación: ' + error.message);
    throw error;
  }
}

module.exports = { startAppSetup };