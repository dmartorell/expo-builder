export default function DocumentationScreen() {
  return (
    <div className="p-8 max-w-3xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Guía de uso de Expo Builder</h1>

      <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">¿Qué es el generador de apps?</h2>
        <p className="mb-4">
          El generador de apps es una herramienta que automatiza la creación de proyectos React Native con Expo SDK 52. 
          Está diseñado específicamente para mantener la consistencia con el ecosistema de Alfred Smart, incluyendo:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Integración con las librerías de Alfred Smart (Verticals y UI Native Components)</li>
          <li>Configuración automática de herramientas de desarrollo:
            <ul className="list-disc ml-6 mt-2">
              <li>ESLint para linting de código</li>
              <li>TypeScript para tipado estático</li>
              <li>Git para control de versiones</li>
              <li>i18n para internacionalización</li>
            </ul>
          </li>
          <li>Estructura de proyecto optimizada y estandarizada</li>
        </ul>
        <p className="mt-4 text-gray-600">
          El objetivo es proporcionar una base sólida y consistente para el desarrollo de nuevas aplicaciones, 
          asegurando que todos los proyectos sigan las mejores prácticas y estándares establecidos.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Requisitos previos</h2>
        <p className="mb-4">
          Antes de comenzar, asegúrate de tener instaladas las siguientes versiones mínimas:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Node {'>='} 18.18.0</li>
          <li>Yarn {'>='} 1.22.22</li>
          <li>Ruby {'>='} 2.6.10p210</li>
          <li>Pod {'>='} 1.16.2</li>
        </ul>
        <p className="mb-4 text-gray-700">
          El usuario puede comprobar lo que tiene instalado a través de la terminal. Si no está alineado (por abajo), 
          cancela y instala lo que necesites.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Fases del proceso</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">1. Configuración del proyecto</h3>
            <p className="mb-4">
              En esta primera fase, el generador crea la estructura base de tu aplicación con todas las configuraciones necesarias 
              para mantener la consistencia con el resto de apps de Alfred Smart. Durante este proceso:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Se instalan todas las dependencias necesarias para el desarrollo</li>
              <li>Se realiza un prebuild del proyecto para generar los archivos nativos</li>
              <li>Se configura el esqueleto base de la aplicación con la estructura de carpetas optimizada</li>
              <li>Se aplican las configuraciones de desarrollo (ESLint, TypeScript, etc.)</li>
            </ul>
            <p className="mt-4">
              Todo el proceso se puede seguir en tiempo real a través de la terminal, donde podrás ver cada paso 
              que se está ejecutando. Una vez completado, el proyecto se guarda en la carpeta <code>generated</code>, 
              lista para pasar a la siguiente fase.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">2. Configuración EAS</h3>
            <p className="mb-4">
              La segunda fase prepara tu proyecto para trabajar con Expo Application Services (EAS), una suite de herramientas 
              que facilita enormemente el desarrollo y despliegue de aplicaciones React Native. Esta fase te permitirá:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Enviar versiones de prueba mediante códigos QR</li>
              <li>Realizar despliegues a producción con un solo comando</li>
              <li>Implementar actualizaciones over the air (OTA)</li>
              <li>Gestionar diferentes entornos (desarrollo, preview, producción)</li>
            </ul>
            <p className="mt-4">
              El proceso es semiautomático y requiere tu interacción en dos momentos clave:
            </p>
            <ol className="list-decimal ml-6 mt-2 space-y-2">
              <li>
                <strong>Configuración del proyecto EAS:</strong> Al dar tu consentimiento, el generador creará un identificador 
                único para tu proyecto en el entorno de trabajo de Alfred Smart en Expo EAS. Esto permitirá gestionar todas las 
                builds y actualizaciones desde el dashboard de Expo.
              </li>
              <li>
                <strong>Limpieza y empaquetado:</strong> En este segundo paso, se ejecuta un script que:
                <ul className="list-disc ml-6 mt-2">
                  <li>Limpia archivos innecesarios</li>
                  <li>Formatea el código según los estándares</li>
                  <li>Empaqueta la aplicación en un archivo ZIP ligero (sin node_modules)</li>
                </ul>
                El resultado es un paquete que puedes mover fácilmente a cualquier directorio de trabajo para comenzar el desarrollo.
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Y ahora ¿qué hago?</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">1. Verificar la estabilidad</h3>
            <p className="mb-4">
              Ejecuta el siguiente comando para verificar la estabilidad del proyecto y las versiones de las dependencias:
            </p>
            <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
              {`npx expo-doctor`}
            </pre>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium mb-2">⚠️ Importante sobre las actualizaciones</p>
              <p className="text-yellow-700">
                No se recomienda actualizar todas las dependencias que muestren warnings. Estos mensajes son meramente informativos 
                y cualquier actualización debe ser consensuada con el equipo. Algunas versiones específicas son necesarias para 
                mantener la compatibilidad con el ecosistema de Alfred Smart.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">2. Configurar eas.json</h3>
            <p className="mb-4">
              Actualiza el archivo <code>eas.json</code> con los siguientes perfiles de build:
            </p>
            <pre className="bg-gray-100 rounded p-2 my-2 text-sm overflow-x-auto">
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

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">3. Variables de entorno</h3>
            <p className="mb-4">
              Para acceder a las librerías privadas de Alfred, necesitas configurar el NPM_TOKEN:
            </p>
            <ol className="list-decimal ml-6 space-y-2">
              <li>
                Ve al{' '}
                <a 
                  href="https://expo.dev/login?redirect_uri=%2Faccounts%2Fsmartalfred%2Fprojects" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  dashboard de Expo del proyecto
                </a>
              </li>
              <li>Navega a Configuration / Environment variables</li>
              <li>Añade una nueva variable llamada NPM_TOKEN para production, preview y development</li>
              <li>La key se encuentra en Psono, dentro de I+D / Cuenta Developer / npmjs.com</li>
              <li>Marca la visibilidad como Sensitive</li>
            </ol>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium mb-2">⚠️ Nota</p>
              <p className="text-yellow-700">
                Si tienes dudas sobre la configuración de las variables de entorno, puedes consultar cómo están declaradas 
                en otros proyectos como Alfred Smart Building como referencia.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">4. Firebase y Google Services</h3>
            <p className="mb-4">
              Asegúrate de tener en el root del proyecto:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Carpeta <code>googleServices</code></li>
              <li>Carpeta <code>keystore</code></li>
              <li>Archivo <code>credentials.json</code></li>
            </ul>
            <p className="mt-4">
              Añade la siguiente configuración en <code>app.config.json</code>:
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
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Solución de problemas comunes</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Error: NativeEventEmitter</h3>
            <p className="mb-4">
              Si encuentras el error:
            </p>
            <pre className="bg-gray-100 rounded p-2 my-2 text-sm whitespace-pre-wrap break-all">
              {`Invariant Violation: new NativeEventEmitter() requires a non-null argument., js engine: hermes`}
            </pre>
            <p className="mb-4">
              Ejecuta la siguiente secuencia de comandos para limpiar la caché:
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
            <p className="mt-4">
              Finalmente, ejecuta:
            </p>
            <pre className="bg-gray-100 rounded p-2 my-2 text-sm">
              {`yarn prebuild --clean
              yarn ios`}
            </pre>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Error: Archivos de credenciales no encontrados</h3>
            <p className="mb-4">
              Si encuentras errores relacionados con archivos de credenciales faltantes, verifica que tienes la siguiente estructura 
              en el root de tu proyecto:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-medium mb-2">Estructura de archivos requerida:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <code>googleServices/</code>
                  <ul className="list-disc ml-6 mt-1 text-sm text-gray-600">
                    <li><code>GoogleService-Info.plist</code> (para iOS)</li>
                    <li><code>google-services.json</code> (para Android)</li>
                    <li><code>playStoreServiceAccount.json</code> (para despliegues a Play Store)</li>
                  </ul>
                </li>
                <li>
                  <code>keystore/</code>
                  <ul className="list-disc ml-6 mt-1 text-sm text-gray-600">
                    <li><code>upload-keystore.jks</code> (para firmar la app de Android)</li>
                  </ul>
                </li>
                <li><code>credentials.json</code> (para configuración general)</li>
              </ul>
            </div>
            <p className="mb-4">
              Estos archivos son necesarios para:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Configuración de Firebase y notificaciones push</li>
              <li>Firma de la aplicación para Android</li>
              <li>Despliegues a las tiendas de aplicaciones</li>
            </ul>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium mb-2">⚠️ Importante</p>
              <p className="text-yellow-700 mb-4">
                La creación de estas credenciales no está descrita en esta guía. Consulta la documentación oficial:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-yellow-700">
                <li>
                  <a 
                    href="https://github.com/expo/fyi/blob/main/creating-google-service-account.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-800"
                  >
                    Uploading a Google Service Account Key for Play Store Submissions with EAS
                  </a>
                  <span className="text-sm"> (para despliegues a store)</span>
                </li>
                <li>
                  <a 
                    href="https://docs.expo.dev/push-notifications/fcm-credentials/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-800"
                  >
                    Obtain Google Service Account Keys
                  </a>
                  <span className="text-sm"> (para push notifications - Firebase)</span>
                </li>
              </ul>
              <p className="text-yellow-700 mt-4">
                Asegúrate de mantener estos archivos seguros y nunca los subas a repositorios públicos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 