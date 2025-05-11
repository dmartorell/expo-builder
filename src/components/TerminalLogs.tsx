import React from 'react';

interface TerminalLogsProps {
  logs?: string[];
  onClearLogs?: () => void;
}

export default function TerminalLogs({ logs = [], onClearLogs }: TerminalLogsProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-2">
        {logs.length === 0 ? (
          <div className="text-gray-500">No hay mensajes aún.</div>
        ) : (
          logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))
        )}
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onClearLogs}
          className="px-6 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
} 