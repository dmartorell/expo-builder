import React, { useState, useEffect } from 'react';
import { BuildsIcon } from './ui/BuildsIcon';
import { Loader2 } from 'lucide-react';

interface Build {
  name: string;
  filename: string;
}

export default function Builds() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/builds');
        if (!response.ok) throw new Error('Error al obtener builds');
        const data = await response.json();
        setBuilds(data.builds);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, []);

  const handleDownload = async (filename: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/download/${filename}`);
      if (!response.ok) throw new Error('Error al descargar el archivo');
      
      // Crear un blob del archivo
      const blob = await response.blob();
      
      // Crear un enlace temporal y hacer clic en él
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 h-[120px]">
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
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{build.name}</span>
                </div>
                <span className="text-xs text-gray-500">.zip</span>
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