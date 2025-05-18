import React from 'react';
import { BuildsIcon } from '../ui/icons/BuildsIcon';
import { Loader2 } from 'lucide-react';
import { FolderIcon } from '../ui/icons/FolderIcon';
import { TrashIcon } from '../ui/icons/TrashIcon';
import { ArrowRightIcon } from '../ui/icons/ArrowRightIcon';
import { useBuilds } from './useBuilds';

const BuildsCard: React.FC = () => {
  const {
    builds,
    loading,
    clearing,
    downloading,
    downloadProgress,
    handleDownload,
    handleClearBuilds
  } = useBuilds();

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
            disabled={clearing}
          >
            {clearing ? (
              <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
            ) : (
              <TrashIcon />
            )}
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
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDownload(build.filename)}
                      disabled={downloading === build.filename}
                      className="px-4 py-2 ml-8 bg-black font-semibold text-white text-xs rounded-md hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading === build.filename ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {downloadProgress}%
                        </>
                      ) : (
                        <>
                          <ArrowRightIcon />
                          Download
                        </>
                      )}
                    </button>
                  </div>
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
};

export default BuildsCard; 