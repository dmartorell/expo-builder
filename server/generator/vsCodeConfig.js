const fs = require('fs');
const path = require('path');

const vsCode = {
  settings: {
    "eslint.lintTask.enable": true,
    "workbench.colorCustomizations": {
      "statusBar.background": "#e1e3ff",
      "statusBar.foreground": "#232323",
      "titleBar.inactiveBackground": "#e1e3ff",
      "titleBar.inactiveForeground": "#232323",
    }
  }
}

const createVsCodeSettings = (projectPath) => {
  const vscodePath = path.join(projectPath, '.vscode');
  const settingsPath = path.join(vscodePath, 'settings.json');

  if (!fs.existsSync(vscodePath)) {
    fs.mkdirSync(vscodePath, { recursive: true });
  }

  fs.writeFileSync(settingsPath, JSON.stringify(vsCode.settings, null, 2));
};

module.exports = { createVsCodeSettings };