import React from 'react';
import TerminalLogs from './TerminalLogs';
import TerminalHeader from './TerminalHeader';
import { useTerminal } from './useTerminal';

interface TerminalProps {
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Terminal({ logs, setLogs }: TerminalProps) {
  const { handleClear, hasLogs } = useTerminal({ logs, setLogs });

  return (
    <>
      <TerminalHeader onClear={handleClear} hasLogs={hasLogs} />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <TerminalLogs logs={logs} />
      </div>
    </>      
  );
}