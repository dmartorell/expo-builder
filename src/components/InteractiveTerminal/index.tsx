import React from 'react';
import { useInteractiveTerminal } from './useInteractiveTerminal';
import 'xterm/css/xterm.css';

interface InteractiveTerminalProps {
  onCommand?: (command: string) => Promise<string>;
  initialOutput?: string;
  initialDir?: string;
  initialCommand?: string;
}

const InteractiveTerminal: React.FC<InteractiveTerminalProps> = (props) => {
  const { terminalRef } = useInteractiveTerminal(props);

  return (
    <div className="terminal-container bg-[#1a1a1a] rounded-lg p-4 h-[400px] w-full">
      <div 
        ref={terminalRef} 
        className="h-full w-full"
        style={{ 
          height: '100%',
          width: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '8px'
        }}
      />
    </div>
  );
};

export default InteractiveTerminal; 