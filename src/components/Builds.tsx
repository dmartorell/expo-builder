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
      const response = await fetch(API_ENDPOINTS.DOWNLOAD(filename));
      if (!response.ok) throw new Error('Error al descargar');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[140px] w-full">
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
                className="flex items-center justify-between p-3 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FolderIcon />
                    <span className="text-sm font-medium text-gray-700">{build.name}.zip</span>
                  </div>
                  <button 
                    onClick={() => handleDownload(build.filename)}
                    className="px-4 py-2 bg-black font-semibold text-white text-xs rounded-md hover:bg-gray-800 transition flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Download
                  </button>
                </div>
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