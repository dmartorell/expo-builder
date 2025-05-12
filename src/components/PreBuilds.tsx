import React, { useState, useEffect } from 'react';
import { BuildsIcon } from './ui/BuildsIcon';
import { Build } from './Builds';
import { Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { FolderIcon } from './ui/FolderIcon';

export default function PreBuilds() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Cargar builds al montar el componente
  useEffect(() => {
    getGeneratedApps();
  }, []);

  // Suscribirse al evento de creación exitosa de app
  useEffect(() => {
    const handleAppCreated = () => {
      getGeneratedApps();
    };

    window.addEventListener('app-created', handleAppCreated);
    return () => {
      window.removeEventListener('app-created', handleAppCreated);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[140px]">
      <div className="flex items-center gap-3 mb-4">
        <BuildsIcon />
        <h2 className="text-xl font-semibold text-gray-700">Pre Builds</h2>
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
                className="flex items-center justify-between p-3 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FolderIcon />
                  <span className="text-sm font-medium text-gray-700">{build.name}</span>
                </div>
                <button 
                  onClick={() => console.log(build.name)}
                  className="px-4 py-2 bg-black font-semibold text-white text-xs rounded-md hover:bg-gray-800 transition"
                >
                  Eas Config
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-left">
            Todavía no se ha generado una app.
          </div>
        )}
      </div>
    </div>
  );
} 