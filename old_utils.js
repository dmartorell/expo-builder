import { exec } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export const logSuccess = (message) => {
  console.log(chalk.green(`✔ ${message}`));
};

export const logError = (message) => {
  console.error(chalk.red(`✖ ${message}`));
}

// Función para ejecutar comandos en la terminal de manera asíncrona
export const executeCommand = (command, message, successMessage = 'Task completed successfully.', projectPath = '.') => {
  return new Promise((resolve, reject) => {
    const spinner = ora(message).start();

    exec(command, { cwd: projectPath }, (error, stdout, stderr) => {
      if (error) {
        spinner.fail(chalk.red(`Error: ${stderr}`));
        spinner.stop();
        reject(stderr);
      } else {
        spinner.succeed(chalk.green(successMessage));
        spinner.stop();
        resolve(stdout);
      }
    });
  });
};

// Función para validar el package name
export const isValidPackageName = (packageName) => {
  const regex = /^[a-zA-Z][a-zA-Z0-9_]*\.[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/;
  return regex.test(packageName);
};

// Función para eliminar los campos 'version' y 'private' del package.json
export const removeFieldsFromPackageJson = (projectPath) => {
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

export const addAndCommitChanges = async (projectPath) => {
  // Verifica si el proyecto tiene una carpeta .git
  const gitDir = path.join(projectPath, '.git');

  if (fs.existsSync(gitDir)) {
    console.log('Git repository found.');
  } else {
    // Si no hay un repositorio Git, inicializar uno
    console.log('No Git repository found. Initializing a new Git repository...');
    await executeCommand('git init', 'Initializing a new Git repository...', 'Git repository initialized.', projectPath);
  }

  // Verificar si la rama 'develop' existe
  const checkBranchCommand = 'git branch --list develop';
  const branchExists = await executeCommand(checkBranchCommand, 'Checking if develop branch exists...', '', projectPath);

  // Si la rama 'develop' no existe, crearla y cambiar a ella
  if (!branchExists.trim()) {
    logSuccess('Branch "develop" does not exist. Creating and switching to "develop"...');
    await executeCommand('git checkout -b develop', 'Creating and switching to develop branch...', 'Switched to develop branch.', projectPath);
  } else {
    logSuccess('Branch "develop" exists. Switching to it...');
    await executeCommand('git checkout develop', 'Switching to develop branch...', 'Switched to develop branch.', projectPath);
  }

  // Ejecutar git add . para agregar todos los archivos modificados en el directorio correcto
  await executeCommand('git add .', 'Adding all modified files to Git...', 'Files added to Git.', projectPath);

  // Hacer un commit con los cambios
  await executeCommand('git commit -m "initial commit"', 'Creating commit for all modified files...', 'Commit created.', projectPath);
};