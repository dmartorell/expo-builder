 Si ya has generado la app y la tienes instalada en el simulador ve directamente al punto 2
1. El generador de apps
El primer paso es descargar el proyecto expoappgenerator. Es, básicamente, un conjunto de archivos de configuración con un script que al ejecutarse genera un proyecto nuevo en Expo con Typescript y linter. 

Asegúrate de tener las versiones mínimas:

Node >= 18.18.0  Yarn >= 1.22.22 Ruby >= 2.6.10p210  Pod >= 1.16.2

Si hay dudas, puedes chequearlo desde la Terminal:
node -v
yarn -v
ruby -v

Desde el root del appGenerator descargamos dependencias y ejecutamos el script:
yarn install && yarn create-app

El prompt del script nos hará dos preguntas:
✔ Nombre del proyecto  
✔ Nombre del package 

Ambos tienen opciones por defecto y pueden cambiarse más tarde.

Una vez finalizado el proceso de creación de la app, el proyecto se habrá creado dentro de la carpeta  generated.  En este punto podemos moverla al directorio que queramos.

En este punto tenemos un proyecto Expo (sdk 52) alineado con las librerías de Alfred (Verticals y UI Native Components), con las configuraciones básicas tanto de desarrollo (esLint, Typescript, Git, i18n). Para poder empezar a trabajar sobre el simulador hay que construir la app. Para ello, desde el root del proyecto generado, ejecutamos el comando:
yarn ios

Al final del proceso tendremos corriendo en el simulador de iOS la nueva app base desde la que empezaremos a construir el nuevo producto.



2. Configuración de EAS
Expo EAS (Expo Application Services) es un conjunto de herramientas y servicios proporcionados por Expo para facilitar la compilación, distribución y actualización de aplicaciones en React Native. Para saber más, aquí hay una documentación específica sobre la gestión de builds con EAS. 
 
Necesitamos instalar globalmente eas-cli:
yarn global add eas-cli 
o
npm install --global eas-cli

Ahora ejecutamos el comando desde el root de nuestro nuevo proyecto:
npx eas-cli build:configure

Seguimos el prompt prompt:
✔ Would you like to automatically create an EAS project for @smartalfred/your-app? Y 
✔ Which platforms would you like to configure for EAS Build? › All

Ahora, el proyecto ya estará creado y subido al dashboard de la organización smartalfred. El proceso añadirá en el archivo app.json una nueva propiedad con un id del  proyecto asociado a EAS. En este punto, debemos copiar el projectId:
 
"extra": {
   "eas": {
     "projectId": "00cd6d1d-8735-4478-b9be-f20d370cf787"
   }
 }
 
Y pegarlo en el projectId del archivo app.config.ts en la carpeta  config.
Borramos el app.json  y colocamos en el root el archivo app.config.ts, que ahora será el que contenga toda la configuración del proyecto en formato TS y con capacidad para inyectarle valores dinámicamente.

Hacemos un prebuild para se sincronicen los últimos cambios hechos
yarn prebuild

Y confirmamos que la estabilidad del proyecto y las versiones de las dependencias son correctas:
npx expo-doctor

  El dinamismo del app.config.ts permite generar diferentes iconos y nombres de app para cada profile de build (development, preview o production). De esta manera, podemos tener al mismo tiempo en el simulador la app de producción y una de desarrollo perfectamente identificables y sin necesidad de borrar una para instalar la otra.

Los settings para conseguir esto están en el app.config.ts del proyecto Alfred Smart Building (Alpha). Se pueden replicar fácilmente. Son necesarios un pack de tres iconos diferentes.  

Ahora necesitamos actualizar el archivo eas.json para definir los perfiles de las builds que vamos a poder usar:

 "development" "ios-simulator" "preview" "production"

Sustituye el código del archivo por este otro:

{
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
}

3. Variables de entorno y Google Service Account
En la creación de los builds, el servicio de Expo necesita acceder a todas las librerías para instalarlas. En nuestro caso, las dependencias de Alfred están en NPM como paquetes privados, por lo que necesitamos darle permisos a Expo para poder descargarlas. 

En el dashboard de Expo del proyecto, vamos a configuration / Environment variables  y añadimos una nueva para production, preview y development. La llamaremos NPM_TOKEN. El valor está registrado en Psono, dentro de I+D / Cuenta Developer / npmjs.com. Lo pegamos en Expo y marcamos la visibilidad a Sensitive. Listo.
4. Firebase y Google Services
Para que el servicio de Firebase funcione, el proyecto tiene que tener definidos los archivos de Google y la configuración en el app.config.json. Del mismo modo, para que el despliegue a producción no falle hay que darle a Expo algunas credenciales. 

Asegúrate tener el en root del proyecto las carpetas   googleServices y   keystore, además de un archivo credentials.json . 

La creación de estas credenciales no está descrito en esta guía, pero puedes echarle un ojo a estos enlaces:
Uploading a Google Service Account Key for Play Store Submissions with EAS (para despliegues a store)
Obtain Google Service Account Keys (para push notifications - Firebase)

En el archivo app.config.json tienes que añadir esta info:

ios: {
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
}

5. Iconos y Splash
Cada proyecto necesita un set de iconos:
adaptive-icon.png (app icon para Android)
icon.png (app icon para iOS)
notification-icon.png (icono de notificaciones para Android)
plash-icon.png

Los tamaños son los siguientes:



  UX-UI debería tomar de referencia estas imágenes y sustituirlas por las del nuevo proyecto.
 La imagen del adaptive-icon de Android y la del Splash deben ser transparentes. Para definir los colores de fondo en ambos casos se han de setear los valores en el app.config.json:

adaptiveIcon: {
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
  ]

6. Contenido
El siguiente paso es limpiar y modificar el App.tsx y crear una carpeta   src en el root con el contenido de la nueva app. 

  Una vez generado el esqueleto básico de la app siguiendo el esquema de hooks, components, constants, contexts... es posible que, al hacer build, aparezca un error:

Invariant Violation: new NativeEventEmitter() requires a non-null argument., js engine: hermes

Normalmente es debido a problemas de caché.
Por lo general, con una limpieza agresiva se soluciona:

rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf android/build
rm -rf android/app/build
rm -rf .expo
rm -rf yarn.lock
yarn install
cd ios && pod install && cd ..
yarn start --reset-cache

Volemos a ejecutar yarn prebuild --clean y yarn ios y la app debería funcionar de manera normal.
