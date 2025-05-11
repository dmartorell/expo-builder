import React from 'react';

interface TerminalHeaderProps {
  onClear: () => void;
}

export default function TerminalHeader({ onClear }: TerminalHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gray-300" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
          <polyline points="8 9 12 13 8 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="14" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Logs
      </h2>
      <button
        className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
        onClick={onClear}
        type="button"
      >
        Clear
      </button>
    </div>
  );
} 