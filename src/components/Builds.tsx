import React, { useState, useEffect } from 'react';
import { BuildsIcon } from './ui/icons/BuildsIcon';
import { Loader2 } from 'lucide-react';
import { FolderIcon } from './ui/icons/FolderIcon';
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

  const handleClearBuilds = async () => {
    try {
      await fetch(API_ENDPOINTS.CLEAR_BUILDS, { method: 'POST' });
      fetchBuilds();
      // Disparar evento de limpieza
      window.dispatchEvent(new Event('builds-cleared'));
    } catch (error) {
      console.error('Error clearing builds:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[140px] w-full">
      <div className="flex items-center gap-3 mb-4">
        <BuildsIcon />
        <h2 className="text-xl font-semibold text-gray-700">Builds</h2>
        {builds.length > 0 && (
          <button
            onClick={handleClearBuilds}
            className="ml-auto px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm font-medium flex items-center gap-2 transition-colors"
            type="button"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-500"
            >
              <path 
                d="M3 6H5H21" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Borrar todos
          </button>
        )}
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