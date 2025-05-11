const fs = require('fs');
const path = require('path');
const { logError, logSuccess } = require('./utils');
const projectConfig = require('./assets/projectConfig.json');

const updateAppJson = (projectPath, appName, packageName) => {
  const appJsonPath = path.join(projectPath, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));

  delete appJson.expo.newArchEnabled;
  appJson.expo.slug = appName;
  appJson.expo.scheme = appName;
  appJson.expo.notification = {
    icon: './assets/notification-icon.png',
    color: '#000000',
  };
  appJson.expo.owner = 'smartalfred';
  appJson.expo.android.package = packageName;
  appJson.expo.android.permissions = [
    'android.permission.CAMERA',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.ACCESS_FINE_LOCATION',
  ];
  appJson.expo.ios.bundleIdentifier = packageName;
  appJson.expo.ios.entitlements = {
      'aps-environment': 'production',
  };
  appJson.expo.ios.infoPlist = {
    CFBundleAllowMixedLocalizations: true,
    ITSAppUsesNonExemptEncryption: false,
    UIBackgroundModes: [
      'remote-notification',
    ],
  };
  appJson.expo.locales = {
    es: './translations/locales_es.json',
    en: './translations/locales_en.json',
  };
  appJson.expo.plugins = [
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
      },
    ],
    [
      'expo-camera',
      {
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-image-picker',
      {
        microphonePermission: false,
      },
    ],
    [
      'expo-localization',
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        imageWidth: 250,
      },
    ],
  ];
  appJson.expo.runtimeVersion = '0.0.1';
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  logSuccess('app.json updated.');
};

const updatePackageJson = (projectPath) => {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Añadir scripts desde el archivo JSON
  packageJson.scripts = {
    ...projectConfig.scripts // Añadir los scripts importados
  };

  // Añadir dependencias
  packageJson.dependencies = {
    ...projectConfig.dependencies // Añadir las dependencias
  };

  // Añadir devDependencies
  packageJson.devDependencies = {
    ...projectConfig.devDependencies // Añadir las devDependencias
  };

  // Añadir peerDependencies
  packageJson.peerDependencies = {
    ...projectConfig.peerDependencies // Añadir las peerDependencies
  };
  
  // Añadir Expo Object
  packageJson.expo = {
    ...projectConfig.expo // Añadir el objeto expo
  };

  // Añadir version
  packageJson.version = '0.0.1';

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  logSuccess('package.json updated.');
};

const replaceGitIgnore = (projectPath) => {
  const scriptGitIgnorePath = path.join(__dirname, 'assets/.gitignore');
  const projectGitIgnorePath = path.join(projectPath, '.gitignore');

  if (fs.existsSync(projectGitIgnorePath)) {
    fs.copyFileSync(scriptGitIgnorePath, projectGitIgnorePath);
    logSuccess('.gitignore updated.');
  } else {
    logError('.gitignore not found.');
  }
};

const addEasIgnore = (projectPath) => {
  const scriptEasIgnorePath = path.join(__dirname, 'assets/.easignore');
  const projectEasIgnorePath = path.join(projectPath, '.easignore');

  if (fs.existsSync(scriptEasIgnorePath)) {
    fs.copyFileSync(scriptEasIgnorePath, projectEasIgnorePath);
    logSuccess('.easignore added.');
  } else {
    logError('.easignore not found.');
  }
};

// Función para copiar el archivo eas.json
const copyEasJson = (projectPath) => {
  const scriptEasConfigPath = path.join(__dirname, 'assets/eas.json');
  const destinationEasConfigPath = path.join(projectPath, 'eas.json');
  
  // Verificar si el archivo eas.json existe en el directorio fuente
  if (fs.existsSync(scriptEasConfigPath)) {
    // Copiar el archivo eas.json al destino
    fs.copyFileSync(scriptEasConfigPath, destinationEasConfigPath);
    logSuccess('eas.json copied.');
  } else {
    logError('Error while copying eas.json: eas.json not found.');
  }
};


const updateAppTsx = (projectPath) => {
  const scriptAppPath = path.join(__dirname, 'assets/appTemplate.txt');
  const projectAppPath = path.join(projectPath, 'App.tsx');

  if (fs.existsSync(scriptAppPath)) {
    fs.copyFileSync(scriptAppPath, projectAppPath);
    logSuccess('App.tsx updated.');
  } else {
    logError('appTemplate.txt not found.');
  }
};

const updateTsConfig = (projectPath) => {
  try {
    const scriptTsConfigPath = path.join(__dirname, 'assets/updatedTsConfig.json');
    const proyectTsConfigPath = path.join(projectPath, 'tsconfig.json');

    if (!fs.existsSync(scriptTsConfigPath)) {
      logError('updatedTsConfig.json not found.');
      return;
    }

    if (!fs.existsSync(proyectTsConfigPath)) {
      logError('tsconfig.json not found in project.');
      return;
    }

    const updatedTsConfig = JSON.parse(fs.readFileSync(scriptTsConfigPath, 'utf-8'));
    fs.writeFileSync(proyectTsConfigPath, JSON.stringify(updatedTsConfig, null, 2));

    logSuccess('tsconfig.json updated.');
  } catch (error) {
    logError('Error while updating tsconfig.json:', error);
  }
};

const copyFilesToProject = (projectPath) => {
  try {
    // Rutas de los archivos y carpeta a copiar
    const filesToCopy = [
      { src: path.join(__dirname, 'assets/i18n.js'), dest: path.join(projectPath, 'i18n.js'), name: 'i18n.js' }, 
      { src: path.join(__dirname, 'assets/credentials.json'), dest: path.join(projectPath, 'credentials.json'), name: 'credentials.json' }, 
      { src: path.join(__dirname, 'assets/eslint.config.mjs'), dest: path.join(projectPath, 'eslint.config.mjs'), name: 'eslint.config.mjs' },
      { src: path.join(__dirname, 'assets/firebase.json'), dest: path.join(projectPath, 'firebase.json'), name: 'firebase.json' },
      { src: path.join(__dirname, 'assets/babel.config.js'), dest: path.join(projectPath, 'babel.config.js'), name: 'babel.config.js' },
      { src: path.join(__dirname, 'assets/notification-icon.png'), dest: path.join(projectPath, 'assets/notification-icon.png'), name: 'notification-icon.png' },
    ];

    // Verificar y copiar archivos
    filesToCopy.forEach((file) => {
      if (fs.existsSync(file.src)) {
        fs.copyFileSync(file.src, file.dest);
        logSuccess(`${file.name} copied.`);
      } else {
        logError(`${file.name} not found.`);
      }
    });

    // Verificar y copiar la carpeta de traducciones
    const translationsSrc = path.join(__dirname, 'assets/translations');
    const translationsDest = path.join(projectPath, 'translations');

    if (fs.existsSync(translationsSrc)) {
      // Si la carpeta existe, copiarla
      fs.mkdirSync(translationsDest, { recursive: true });
      fs.readdirSync(translationsSrc).forEach(file => {
        const srcFile = path.join(translationsSrc, file);
        const destFile = path.join(translationsDest, file);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, destFile);
          logSuccess(`${file} copied.`);
        } else {
          logError(`${file} not found.`);
        }
      });
    } else {
      logError('translations folder not found.');
    }

  } catch (error) {
    logError('Error while copying files:', error);
  }
};

const copyAndModifyAppConfig = (projectPath, newValues) => {
  try {
    // Leer el archivo original
    const appConfigPath = path.join(__dirname, 'assets/app.config.ts');
    let appConfigFile = fs.readFileSync(appConfigPath, 'utf8');

    // Reemplazar los campos específicos
    if (newValues.slug) {
      appConfigFile = appConfigFile.replace(/slug: ['"]([^'"]+)['"]/, `slug: '${newValues.slug.toLowerCase()}'`);
    }

    if (newValues.scheme) {
      appConfigFile = appConfigFile.replace(/scheme: ['"]([^'"]+)['"]/, `scheme: '${newValues.scheme.toLowerCase()}'`);
    }
    
    if (newValues.name) {
      appConfigFile = appConfigFile.replace(/name: ['"]([^'"]+)['"]/, `name: '${newValues.name}'`);
    }
    
    if (newValues.bundleIdentifier) {
      appConfigFile = appConfigFile.replace(/bundleIdentifier: ['"]([^'"]+)['"]/, `bundleIdentifier: '${newValues.bundleIdentifier}'`);
    }
    
    if (newValues.package) {
      appConfigFile = appConfigFile.replace(/package: ['"]([^'"]+)['"]/, `package: '${newValues.package}'`);
    }

    appConfigFile = appConfigFile.replace(/^\s*\/\/\s*@ts-ignore\s*\n?/gm, '');

    // Asegurar que la carpeta "config/" existe
    const configDir = path.join(projectPath, 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Escribir el nuevo archivo
    const outputConfigPath = path.join(projectPath, 'config/app.config.ts');
    fs.writeFileSync(outputConfigPath, appConfigFile, 'utf8');
    logSuccess('app.config.ts created.');
  } catch (error) {
    logError('Error while updating app.config.ts:', error);
  }
}

module.exports = {
  updateAppJson,
  updatePackageJson,
  replaceGitIgnore,
  addEasIgnore,
  copyEasJson,
  updateAppTsx,
  updateTsConfig,
  copyFilesToProject,
  copyAndModifyAppConfig,
};
