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
const fs = require('fs');
const path = require('path');

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

    // Mueve los iconos subidos a la carpeta assets
    moveUploadedIconsToAssets(projectPath, iconPaths);

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

// Mueve los iconos subidos a la carpeta assets del proyecto generado, con logs de depuración
function moveUploadedIconsToAssets(projectPath, iconPaths) {
  const assetsDir = path.join(projectPath, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log('Carpeta assets creada:', assetsDir);
  }

  // iconIos
  if (iconPaths.iconIos) {
    if (fs.existsSync(iconPaths.iconIos)) {
      fs.copyFileSync(iconPaths.iconIos, path.join(assetsDir, 'icon.png'));
      console.log('iconIos copiado a assets/icon.png');
    } else {
      console.log('iconIos no existe:', iconPaths.iconIos);
    }
  }
  // iconAndroid
  if (iconPaths.iconAndroid) {
    if (fs.existsSync(iconPaths.iconAndroid)) {
      fs.copyFileSync(iconPaths.iconAndroid, path.join(assetsDir, 'adaptive-icon.png'));
      console.log('iconAndroid copiado a assets/adaptive-icon.png');
    } else {
      console.log('iconAndroid no existe:', iconPaths.iconAndroid);
    }
  }
  // iconNotification
  if (iconPaths.iconNotification) {
    if (fs.existsSync(iconPaths.iconNotification)) {
      fs.copyFileSync(iconPaths.iconNotification, path.join(assetsDir, 'notification-icon.png'));
      console.log('iconNotification copiado a assets/notification-icon.png');
    } else {
      console.log('iconNotification no existe:', iconPaths.iconNotification);
    }
  }
  // iconSplash
  if (iconPaths.iconSplash) {
    if (fs.existsSync(iconPaths.iconSplash)) {
      fs.copyFileSync(iconPaths.iconSplash, path.join(assetsDir, 'splash-icon.png'));
      console.log('iconSplash copiado a assets/splash-icon.png');
    } else {
      console.log('iconSplash no existe:', iconPaths.iconSplash);
    }
  }
}

module.exports = { startAppSetup };