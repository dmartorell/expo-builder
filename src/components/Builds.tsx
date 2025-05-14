import React, { useState, useEffect } from 'react';
import { BuildsIcon } from './ui/BuildsIcon';
import { Loader2 } from 'lucide-react';
import { FolderIcon } from './ui/FolderIcon';
import { API_ENDPOINTS } from '../config/api';

export interface Build {
  name: string;
  filename: string;
}

export default function Builds() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDownload = async (filename: string) => {
    try {
      // Abrir la URL en una nueva pestaña
      window.open(API_ENDPOINTS.DOWNLOAD(filename), '_blank');
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[140px]">
      <div className="flex items-center gap-3 mb-4">
        <BuildsIcon />
        <h2 className="text-xl font-semibold text-gray-700">Builds</h2>
      </div>
      <div className="min-h-[50px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-black animate-spin" />
          </div>
        ) : builds.length > 0 ? (
          <div className="space-y-3 w-full">
            {builds.map((build) => (
              <div
                key={build.filename}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleDownload(build.filename)}
              >
                <div className="flex items-center gap-2">
                  <FolderIcon />
                  <span className="text-sm font-medium text-gray-700">{build.name}</span>
                </div>
                <span className="text-xs text-gray-500">.zip</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-left">
            Todavía no se ha generado un build completo.
          </div>
        )}
      </div>
    </div>
  );
} 