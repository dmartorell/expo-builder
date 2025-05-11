const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const logSuccess = async (message) => {
  const chalk = (await import('chalk')).default;
  console.log(chalk.green(`✔ ${message}`));
};

const logError = async (message) => {
  const chalk = (await import('chalk')).default;
  console.error(chalk.red(`✖ ${message}`));
}

// Función para ejecutar comandos en la terminal de manera asíncrona
const executeCommand = async (command, message, successMessage = 'Task completed successfully.', _, projectPath = '.') => {
  return new Promise((resolve, reject) => {
    // Log de inicio de spinner
    console.log(`SPINNER_START: ${message}`);

    exec(command, { cwd: projectPath }, (error, stdout, stderr) => {
      if (error) {
        // Log de error de spinner con mensaje más claro
        let errorMsg = stderr || error.message || 'Error desconocido';
        if (
          errorMsg.includes('Try using a new directory name') ||
          errorMsg.includes('already exists')
        ) {
          errorMsg += '\nEs posible que ya exista una carpeta con ese nombre de app. Elimina la carpeta o elige otro nombre.';
        }
        console.log(`SPINNER_FAIL: ${errorMsg}`);
        reject(errorMsg);
      } else {
        // Log de éxito de spinner
        console.log(`SPINNER_SUCCESS: ${successMessage}`);
        resolve(stdout);
      }
    });
  });
};

// Función para validar el package name
const isValidPackageName = (packageName) => {
  const regex = /^[a-zA-Z][a-zA-Z0-9_]*\.[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/;
  return regex.test(packageName);
};

// Función para eliminar los campos 'version' y 'private' del package.json
const removeFieldsFromPackageJson = (projectPath) => {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Eliminar los campos 'version' y 'private'
    delete packageJson.version;
    delete packageJson.private;

    // Guardar el archivo sin los campos eliminados
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
};

const addAndCommitChanges = async (projectPath) => {
  // Verifica si el proyecto tiene una carpeta .git
  const gitDir = path.join(projectPath, '.git');

  if (fs.existsSync(gitDir)) {
    console.log('Git repository found.');
  } else {
    // Si no hay un repositorio Git, inicializar uno
    console.log('No Git repository found. Initializing a new Git repository...');
    await executeCommand('git init', 'Initializing a new Git repository...', 'Git repository initialized.', null, projectPath);
  }

  // Verificar si la rama 'develop' existe
  const checkBranchCommand = 'git branch --list develop';
  const branchExists = await executeCommand(checkBranchCommand, 'Checking if develop branch exists...', '', null, projectPath);

  // Si la rama 'develop' no existe, crearla y cambiar a ella
  if (!branchExists.trim()) {
    console.log('Branch "develop" does not exist. Creating and switching to "develop"...');
    await executeCommand('git checkout -b develop', 'Creating and switching to develop branch...', 'Switched to develop branch.', null, projectPath);
  } else {
    console.log('Branch "develop" exists. Switching to it...');
    await executeCommand('git checkout develop', 'Switching to develop branch...', 'Switched to develop branch.', null, projectPath);
  }

  // Ejecutar git add . para agregar todos los archivos modificados en el directorio correcto
  await executeCommand('git add .', 'Adding all modified files to Git...', 'Files added to Git.', null, projectPath);

  // Hacer un commit con los cambios
  await executeCommand('git commit -m "initial commit"', 'Creating commit for all modified files...', 'Commit created.', null, projectPath);
};

module.exports = {
  logSuccess,
  logError,
  executeCommand,
  isValidPackageName,
  removeFieldsFromPackageJson,
  addAndCommitChanges,
};