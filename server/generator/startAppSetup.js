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
const archiver = require('archiver');

/**
 * Genera una app Expo usando los datos recibidos
 * @param {Object} options
 * @param {string} options.appName
 * @param {string} options.packageName
 * @param {Object} options.iconPaths
 */
async function startAppSetup({ appName, packageName, iconPaths = {} }) {
  try {
    console.log(`Starting app generation: ${appName}`);
    if (!isValidPackageName(packageName)) {
      throw new Error('Invalid package name. It must have a reverse domain format.');
    }
    const parsedAppName = appName.toLowerCase().replace(/\s/g, '-');
    const projectPath = `generated/${parsedAppName}`;

    // Verificar si el directorio ya existe
    if (fs.existsSync(projectPath)) {
      throw new Error(`Directory '${projectPath}' already exists. Please choose another name for your application or delete the existing directory.`);
    }

    await executeCommand(
      `yarn create expo-app ${projectPath} --template expo-template-blank-typescript`,
      `Generating Expo project ${parsedAppName}...`,
      'Project created successfully.',
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
      'Installing dependencies...',
      'Dependencies installed.',
      null,
      '.'
    );
    await executeCommand(
      `cd ${projectPath} && npx expo prebuild`,
      'Running prebuild...',
      'Prebuild completed.',
      null,
      '.'
    );
    await addAndCommitChanges(projectPath);

    // // Eliminar node_modules
    // console.log('Eliminando node_modules...');
    // const nodeModulesPath = path.join(projectPath, 'node_modules');
    // if (fs.existsSync(nodeModulesPath)) {
    //   fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    //   console.log('node_modules eliminado correctamente');
    // }

    // // Crear carpeta builds si no existe
    // const buildsDir = path.join(__dirname, '..', 'builds');
    // if (!fs.existsSync(buildsDir)) {
    //   fs.mkdirSync(buildsDir, { recursive: true });
    //   console.log('Carpeta builds creada');
    // }

    // // Crear archivo ZIP
    // console.log('Creando archivo ZIP...');
    // const zipPath = path.join(buildsDir, `${parsedAppName}.zip`);
    // const output = fs.createWriteStream(zipPath);
    // const archive = archiver('zip', {
    //   zlib: { level: 9 } // Máxima compresión
    // });

    // return new Promise((resolve, reject) => {
    //   output.on('close', () => {
    //     console.log(`Archivo ZIP creado: ${zipPath}`);
    //     console.log(`Tamaño total: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    //     resolve();
    //   });

    //   archive.on('error', (err) => {
    //     console.error('Error al crear el ZIP:', err);
    //     reject(err);
    //   });

    //   archive.pipe(output);
    //   archive.directory(projectPath, parsedAppName);
    //   archive.finalize();
    // }).then(() => {
    //   // Limpia la carpeta uploads
    //   cleanUploadsFolder();
    //   console.log('Proceso finalizado.');
    // }).catch((error) => {
    //   console.error('Error en la generación:', error);
    //   throw error;
    // });
  } catch (error) {
    // Solo lanzamos el error sin imprimir, ya que será manejado en generateApp
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

// Nueva función para limpiar la carpeta uploads
function cleanUploadsFolder() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    fs.readdirSync(uploadsDir).forEach(file => {
      const filePath = path.join(uploadsDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log('Archivo eliminado de uploads:', filePath);
      } catch (err) {
        console.error('Error eliminando archivo de uploads:', filePath, err);
      }
    });
  }
}

module.exports = { startAppSetup };