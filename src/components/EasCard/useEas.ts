import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { Build } from '../BuildsCard/useBuilds';

interface UseEasProps {
  logs: string[];
}

export const useEas = ({ logs }: UseEasProps) => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [currentApp, setCurrentApp] = useState<string>('');

  // Determinar si hay un proceso en marcha basado en los logs
  const isProcessing = showTerminal || logs.some(log => 
    // Procesos de EAS
    (log.includes('Comprobando versión de eas-cli') ||
    log.includes('Instalando eas-cli globalmente') ||
    log.includes('Configurando Eas Project') ||
    log.includes('Updating configuration') ||
    // Procesos de generación de app
    log.includes('Generating Expo project') ||
    log.includes('Installing dependencies') ||
    log.includes('Running prebuild') ||
    log.includes('Creating ZIP file') ||
    // Procesos de limpieza
    log.includes('Removing node_modules') ||
    log.includes('Cleaning up project')) &&
    !logs.some(log => log.includes('Process completed'))
  );

  const getGeneratedApps = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.GENERATED_APPS);
      if (!response.ok) throw new Error('Error al obtener builds');
      const data = await response.json();
      setBuilds(data.generatedApps);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEasConfig = async (appName: string) => {
    console.log('EAS Config clicked for:', appName);
    setCurrentApp(appName);
    setShowTerminal(true);
    console.log('Terminal should be visible now');
  };

  const handleTerminalCommand = async (command: string) => {
    console.log('Executing command:', command);
    try {
      const response = await fetch(API_ENDPOINTS.TERMINAL_EXECUTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          cwd: `server/generated/${currentApp}`
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error);
      }

      // Leer la respuesta como stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let output = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Convertir el chunk a texto y añadirlo a la salida
        const chunk = new TextDecoder().decode(value);
        output += chunk;
      }

      return output;
    } catch (error: any) {
      console.error('Error:', error);
      throw error;
    }
  };

  // Cargar builds al montar el componente
  useEffect(() => {
    getGeneratedApps();

    // Escuchar el evento de creación exitosa de app
    const handleAppCreated = () => {
      getGeneratedApps();
    };

    // Escuchar el evento de limpieza de builds
    const handleBuildsCleared = () => {
      getGeneratedApps();
    };

    window.addEventListener('app-created', handleAppCreated);
    window.addEventListener('builds-cleared', handleBuildsCleared);
    
    return () => {
      window.removeEventListener('app-created', handleAppCreated);
      window.removeEventListener('builds-cleared', handleBuildsCleared);
    };
  }, []);

  return {
    builds,
    loading,
    showTerminal,
    currentApp,
    isProcessing,
    handleEasConfig,
    handleTerminalCommand
  };
}; 