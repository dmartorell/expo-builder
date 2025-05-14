import React from 'react';

export default function Documentation() {
  return (
    <div className="p-8 max-w-3xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Guía de uso del generador de apps</h1>
      <div className="mb-8">
        <div className="mb-2 text-sm text-gray-500 italic">
          Si ya has generado la app y la tienes instalada en el simulador ve directamente al punto 2.
        </div>
        <h2 className="text-2xl font-semibold mt-6 mb-2">1. El generador de apps</h2>
        <p>
          El primer paso es descargar el proyecto <b>expoappgenerator</b>. Es, básicamente, un conjunto de archivos de configuración con un script que al ejecutarse genera un proyecto nuevo en Expo con Typescript y linter.
        </p>
        <div className="mt-2 mb-2">
          <b>Asegúrate de tener las versiones mínimas:</b>
          <ul className="list-disc ml-6">
            <li>Node <span className="font-mono">&gt;= 18.18.0</span></li>
            <li>Yarn <span className="font-mono">&gt;= 1.22.22</span></li>
            <li>Ruby <span className="font-mono">&gt;= 2.6.10p210</span></li>
            <li>Pod <span className="font-mono">&gt;= 1.16.2</span></li>
          </ul>
        </div>
        <p>Si hay dudas, puedes chequearlo desde la Terminal:</p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`node -v
yarn -v
ruby -v`}
        </pre>
        <p>
          Desde el root del appGenerator descargamos dependencias y ejecutamos el script:
        </p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`yarn install && yarn create-app`}
        </pre>
        <p>
          El prompt del script nos hará dos preguntas:
        </p>
        <ul className="list-disc ml-6">
          <li>✔ Nombre del proyecto</li>
          <li>✔ Nombre del package</li>
        </ul>
        <p>
          Ambos tienen opciones por defecto y pueden cambiarse más tarde.
        </p>
        <p>
          Una vez finalizado el proceso de creación de la app, el proyecto se habrá creado dentro de la carpeta <b>generated</b>. En este punto podemos moverla al directorio que queramos.
        </p>
        <p>
          En este punto tenemos un proyecto Expo (sdk 52) alineado con las librerías de Alfred (Verticals y UI Native Components), con las configuraciones básicas tanto de desarrollo (esLint, Typescript, Git, i18n). Para poder empezar a trabajar sobre el simulador hay que construir la app. Para ello, desde el root del proyecto generado, ejecutamos el comando:
        </p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`yarn ios`}
        </pre>
        <p>
          Al final del proceso tendremos corriendo en el simulador de iOS la nueva app base desde la que empezaremos a construir el nuevo producto.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">2. Configuración de EAS</h2>
        <p>
          Expo EAS (Expo Application Services) es un conjunto de herramientas y servicios proporcionados por Expo para facilitar la compilación, distribución y actualización de aplicaciones en React Native. Para saber más, aquí hay una documentación específica sobre la gestión de builds con EAS.
        </p>
        <p className="mt-2">Necesitamos instalar globalmente <b>eas-cli</b>:</p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`yarn global add eas-cli
# o
npm install --global eas-cli`}
        </pre>
        <p>Ahora ejecutamos el comando desde el root de nuestro nuevo proyecto:</p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`npx eas-cli build:configure`}
        </pre>
        <p>Seguimos el prompt:</p>
        <ul className="list-disc ml-6">
          <li>✔ Would you like to automatically create an EAS project for @smartalfred/your-app? <b>Y</b></li>
          <li>✔ Which platforms would you like to configure for EAS Build? <b>All</b></li>
        </ul>
        <p>
          Ahora, el proyecto ya estará creado y subido al dashboard de la organización smartalfred. El proceso añadirá en el archivo <b>app.json</b> una nueva propiedad con un id del proyecto asociado a EAS. En este punto, debemos copiar el <b>projectId</b>:
        </p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`"extra": {
  "eas": {
    "projectId": "00cd6d1d-8735-4478-b9be-f20d370cf787"
  }
}`}
        </pre>
        <p>
          Y pegarlo en el <b>projectId</b> del archivo <b>app.config.ts</b> en la carpeta <b>config</b>.
          Borramos el <b>app.json</b> y colocamos en el root el archivo <b>app.config.ts</b>, que ahora será el que contenga toda la configuración del proyecto en formato TS y con capacidad para inyectarle valores dinámicamente.
        </p>
        <p>
          Hacemos un prebuild para que se sincronicen los últimos cambios hechos:
        </p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`yarn prebuild`}
        </pre>
        <p>
          Y confirmamos que la estabilidad del proyecto y las versiones de las dependencias son correctas:
        </p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`npx expo-doctor`}
        </pre>
        <p>
          El dinamismo del <b>app.config.ts</b> permite generar diferentes iconos y nombres de app para cada profile de build (development, preview o production). De esta manera, podemos tener al mismo tiempo en el simulador la app de producción y una de desarrollo perfectamente identificables y sin necesidad de borrar una para instalar la otra.
        </p>
        <p>
          Los settings para conseguir esto están en el <b>app.config.ts</b> del proyecto Alfred Smart Building (Alpha). Se pueden replicar fácilmente. Son necesarios un pack de tres iconos diferentes.
        </p>
        <p>
          Ahora necesitamos actualizar el archivo <b>eas.json</b> para definir los perfiles de las builds que vamos a poder usar:
        </p>
        <ul className="list-disc ml-6">
          <li>development</li>
          <li>ios-simulator</li>
          <li>preview</li>
          <li>production</li>
        </ul>
        <p>Sustituye el código del archivo por este otro:</p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm overflow-x-auto whitespace-pre-wrap break-all">
{`{
  "build": {
    "development": {
      "channel": "development",
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "development"
      }
    },
    "ios-simulator": {
      "channel": "ios-simulator",
      "extends": "development",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "channel": "preview",
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "preview"
      },
      "ios": {
        "credentialsSource": "remote"
      }
    },
    "production": {
      "android": {
        "credentialsSource": "local"
      },
      "autoIncrement": true,
      "channel": "production"
    }
  },
  "cli": {
    "appVersionSource": "remote",
    "version": ">= 15.0.10"
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./googleServices/playStoreServiceAccount.json",
        "track": "alpha"
      }
    }
  }
}`}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">3. Variables de entorno y Google Service Account</h2>
        <p>
          En la creación de los builds, el servicio de Expo necesita acceder a todas las librerías para instalarlas. En nuestro caso, las dependencias de Alfred están en NPM como paquetes privados, por lo que necesitamos darle permisos a Expo para poder descargarlas.
        </p>
        <p>
          En el dashboard de Expo del proyecto, vamos a <b>configuration / Environment variables</b> y añadimos una nueva para <b>production</b>, <b>preview</b> y <b>development</b>. La llamaremos <b>NPM_TOKEN</b>. El valor está registrado en Psono, dentro de I+D / Cuenta Developer / npmjs.com. Lo pegamos en Expo y marcamos la visibilidad a <b>Sensitive</b>. Listo.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">4. Firebase y Google Services</h2>
        <p>
          Para que el servicio de Firebase funcione, el proyecto tiene que tener definidos los archivos de Google y la configuración en el <b>app.config.json</b>. Del mismo modo, para que el despliegue a producción no falle hay que darle a Expo algunas credenciales.
        </p>
        <p>
          Asegúrate tener en el root del proyecto las carpetas <b>googleServices</b> y <b>keystore</b>, además de un archivo <b>credentials.json</b>.
        </p>
        <p>
          La creación de estas credenciales no está descrita en esta guía, pero puedes echarle un ojo a estos enlaces:
        </p>
        <ul className="list-disc ml-6">
          <li>
            <a href="https://docs.expo.dev/submit/android/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
              Uploading a Google Service Account Key for Play Store Submissions with EAS
            </a> (para despliegues a store)
          </li>
          <li>
            <a href="https://firebase.google.com/docs/admin/setup" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
              Obtain Google Service Account Keys
            </a> (para push notifications - Firebase)
          </li>
        </ul>
        <p className="mt-2">
          En el archivo <b>app.config.json</b> tienes que añadir esta info:
        </p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`ios: {
  googleServicesFile: './googleServices/GoogleService-Info.plist'
  ...
}

android: {
  googleServicesFile: './googleServices/google-services.json',
  ...
},

plugins: [
  '@react-native-firebase/app',
  '@react-native-firebase/messaging',
   ...
]`}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">5. Iconos y Splash</h2>
        <p>
          Cada proyecto necesita un set de iconos:
        </p>
        <ul className="list-disc ml-6">
          <li><b>adaptive-icon.png</b> (app icon para Android)</li>
          <li><b>icon.png</b> (app icon para iOS)</li>
          <li><b>notification-icon.png</b> (icono de notificaciones para Android)</li>
          <li><b>splash-icon.png</b></li>
        </ul>
        <p className="mt-2">
          Los tamaños son los siguientes:
        </p>
        {/* Aquí puedes añadir una tabla o lista de tamaños si lo deseas */}
        <p className="mt-2">
          UX-UI debería tomar de referencia estas imágenes y sustituirlas por las del nuevo proyecto.
          La imagen del adaptive-icon de Android y la del Splash deben ser transparentes. Para definir los colores de fondo en ambos casos se han de setear los valores en el <b>app.config.json</b>:
        </p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`adaptiveIcon: {
  backgroundColor: '#ffffff',
  foregroundImage: './assets/adaptive-icon.png',
},

...

plugins: [

  [
    'expo-splash-screen',
    {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      imageWidth: 250,
    },
   ],
]`}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">6. Contenido</h2>
        <p>
          El siguiente paso es limpiar y modificar el <b>App.tsx</b> y crear una carpeta <b>src</b> en el root con el contenido de la nueva app.
        </p>
        <p>
          Una vez generado el esqueleto básico de la app siguiendo el esquema de hooks, components, constants, contexts... es posible que, al hacer build, aparezca un error:
        </p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm whitespace-pre-wrap break-all">
{`Invariant Violation: new NativeEventEmitter() requires a non-null argument., js engine: hermes`}
        </pre>
        <p>
          Normalmente es debido a problemas de caché. Por lo general, con una limpieza agresiva se soluciona:
        </p>
        <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
{`rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf android/build
rm -rf android/app/build
rm -rf .expo
rm -rf yarn.lock
yarn install
cd ios && pod install && cd ..
yarn start --reset-cache`}
        </pre>
        <p>
          Volemos a ejecutar <b>yarn prebuild --clean</b> y <b>yarn ios</b> y la app debería funcionar de manera normal.
        </p>
      </div>
    </div>
  );
} 