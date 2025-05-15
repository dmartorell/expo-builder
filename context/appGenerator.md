# Expo Builder

[![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)](https://semver.org)
## Description

This script automates the creation of a React Native app using Expo with TypeScript. It sets up the project, installs dependencies, applies custom files such as i18n, firebase, and eslint. Additionally, it runs expo prebuild to prepare the app for native code. It serves as the basic skeleton for building a new Alfred Smart bundle.

## Key Features

- An Expo project is generated with the same dependencies as Alpha.
- The Android and iOS folders are created.
- Basic configurations for linter, i18n, tsconfig, and Babel are added.

## Prerequisites

- **Node.js** (`>=18.0.0`)
- **Yarn** (`>=1.22.22`)
- **Ruby** (`>=2.6.10p210`)
- **Pod** (`>=1.16.2`)

##  Installation

### Copy the folder with the script

```bash
/expoAppGenerator
cd expoAppGenerator
```

### Install Dependencies

```bash
yarn install
```

### Main Commands

```bash
# Start project
yarn create-app
```

##  Usage
Follow the prompt questions:
```bash
# What is the name of the project? (my-expo-app)
This will be the name displayed under the app icon.
```

```bash
# What is your appâ€™s package name? 
These are the identifiers that Google and Apple will use to manage the app in their stores.
```

ðŸš§ Name an package name can be changed later.


The project is automatically built and saved on:
```bash
/generated/name-of-the-app
```

## ðŸ”— Links

- ðŸ“„ **Documentation**: [https://app.clickup.com/20497171/v/dc/khgrk-25435/khgrk-45055]
