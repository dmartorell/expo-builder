# Expo Builder

Expo Builder es una herramienta que simplifica la creación y gestión de aplicaciones móviles usando Expo. Permite generar, configurar y construir aplicaciones de manera eficiente.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- **Frontend**: Interfaz de usuario desarrollada con React y Vite
- **Backend**: Servidor Node.js que maneja la generación de aplicaciones y la gestión de builds

## Características

- 🚀 Generación rápida de aplicaciones Expo
- 📱 Configuración de iconos para iOS y Android
- 🔧 Integración con EAS Build
- 📦 Gestión de builds y descargas
- 📝 Documentación integrada

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Expo
- EAS CLI (se instala automáticamente)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/smartalfred/expo-builder.git
cd expo-builder
```

2. Instala las dependencias del Frontend:
```bash
# En la raíz del proyecto
npm install
# o
yarn install
```

3. Instala las dependencias del Backend:
```bash
# En la carpeta server
cd server
npm install
# o
yarn install
cd ..
```

4. Inicia ambos servidores:

Para el Frontend (en la raíz del proyecto):
```bash
npm run dev
# o
yarn dev
```

Para el Backend (en una nueva terminal, desde la carpeta server):
```bash
npm run dev
# o
yarn dev
```

El frontend estará disponible en `http://localhost:5173` y el backend en `http://localhost:4000`.

## Uso

### Generar una Nueva Aplicación

1. Accede a la pestaña "Builder"
2. Completa el formulario con:
   - Nombre del proyecto
   - Nombre del paquete
   - Iconos para iOS y Android
   - Icono de notificación
   - Imagen de splash screen

3. Haz clic en "Generate App" para crear la aplicación

### Configurar EAS Build

1. En la sección EAS, selecciona la aplicación generada
2. Haz clic en "Start EAS Config"
3. Sigue las instrucciones en la terminal integrada

### Gestionar Builds

- Descarga builds completados desde la sección "Builds"
- Limpia todos los builds y apps generadas con el botón "Borrar todos"

## Variables de Entorno

No se requieren variables de entorno para el funcionamiento básico de la herramienta. El servidor de desarrollo se ejecutará por defecto en `http://localhost:4000`.

Si necesitas cambiar la URL del servidor, puedes crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=tu_url_del_servidor
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con Vite
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la versión de producción
- `npm run lint`: Ejecuta el linter en archivos TypeScript

## Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si encuentras algún problema o tienes alguna sugerencia, por favor abre un issue en el repositorio. 