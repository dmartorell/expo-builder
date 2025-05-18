import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';

export interface Build {
  name: string;
  filename: string;
}

export const useBuilds = () => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const fetchBuilds = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.BUILDS);
      if (!response.ok) throw new Error('Error al obtener builds');
      const data = await response.json();
      setBuilds(data.builds);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      setDownloading(filename);
      setDownloadProgress(0);

      const response = await fetch(API_ENDPOINTS.DOWNLOAD(filename));
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error('No response body');

      // Obtener el tamaño total del archivo
      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      // Crear un ReadableStream para leer la respuesta
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        received += value.length;

        // Actualizar el progreso
        if (total) {
          setDownloadProgress(Math.round((received / total) * 100));
        }
      }

      // Concatenar los chunks en un solo Uint8Array
      const chunksAll = new Uint8Array(received);
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }

      // Crear el blob y descargar
      const blob = new Blob([chunksAll], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar:', error);
      if (error instanceof Error) {
        alert(`Error al descargar el archivo: ${error.message}`);
      } else {
        alert('Error desconocido al descargar el archivo');
      }
    } finally {
      setDownloading(null);
      setDownloadProgress(0);
    }
  };

  const handleClearBuilds = async () => {
    try {
      setClearing(true);
      await fetch(API_ENDPOINTS.CLEAR_BUILDS, { method: 'POST' });
      fetchBuilds();
      // Disparar evento de limpieza
      window.dispatchEvent(new Event('builds-cleared'));
    } catch (error) {
      console.error('Error clearing builds:', error);
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetchBuilds();

    // Escuchar el evento de nuevo build
    const handleNewBuild = () => {
      fetchBuilds();
    };

    window.addEventListener('new-build-created', handleNewBuild);
    return () => {
      window.removeEventListener('new-build-created', handleNewBuild);
    };
  }, []);

  return {
    builds,
    loading,
    clearing,
    downloading,
    downloadProgress,
    handleDownload,
    handleClearBuilds
  };
}; 