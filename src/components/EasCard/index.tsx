import React from 'react';
import { EasIcon } from '../ui/icons/EasIcon';
import { Loader2 } from 'lucide-react';
import { FolderIcon } from '../ui/icons/FolderIcon';
import InteractiveTerminal from '../InteractiveTerminal';
import { useEas } from './useEas';
import { ArrowRightIcon } from '../ui/icons/ArrowRightIcon';

interface EasCardProps {
  logs: string[];
}

const EasCard: React.FC<EasCardProps> = ({ logs }) => {
  const {
    builds,
    loading,
    showTerminal,
    currentApp,
    isProcessing,
    handleEasConfig,
    handleTerminalCommand
  } = useEas({ logs });

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[140px] w-full">
      <div className="flex items-center gap-3 mb-4">
        <EasIcon />
        <h2 className="text-xl font-semibold text-gray-700">EAS</h2>
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
                    <span className="text-sm font-medium text-gray-700">{build.name}</span>
                  </div>
                  <button 
                    onClick={() => handleEasConfig(build.name)}
                    disabled={isProcessing}
                    className={`px-4 py-2 ml-8 font-semibold text-xs rounded-md transition flex items-center gap-2 ${
                      isProcessing 
                        ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    <ArrowRightIcon />
                    Start EAS Config
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-left">
            Todavía no se ha generado una app.
          </div>
        )}
      </div>

      {showTerminal && (
        <div className="mt-4 w-full">
          <InteractiveTerminal 
            onCommand={handleTerminalCommand}
            initialCommand="npm list -g eas-cli || npm install --global eas-cli; npx eas-cli build:configure"
            initialOutput={`Configurando EAS para ${currentApp}...\n`}
            initialDir={`server/generated/${currentApp}`}
          />
        </div>
      )}
    </div>
  );
};

export default EasCard; 