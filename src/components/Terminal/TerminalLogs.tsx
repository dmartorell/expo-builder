import React from 'react';
import { Loader2 } from "lucide-react";
import { useTerminal } from './useTerminal';

interface TerminalLogsProps {
  logs: string[];
}

const Check = () => <span className="mr-2 text-green-500 text-2xl">✓</span>;

export default function TerminalLogs({ logs }: TerminalLogsProps) {
  const { containerRef, handleScroll, steps } = useTerminal({ 
    logs, 
    setLogs: () => {}, // No-op because in this component we don't need to modify logs
    loadSystemVersions: false // Disable system versions loading in this component
  });

  return (
    <div className="h-full flex flex-col">
      <div 
        ref={containerRef} 
        onScroll={handleScroll}
        className="flex-1 whitespace-pre-wrap break-words font-mono text-sm space-y-1 overflow-y-auto
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {steps.length === 0 ? (
          ""
        ) : (
          steps.map((step, i) => {
            if (step.type === 'spinner') {
              if (step.status === 'start') {
                return <div key={i} className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin text-green-400" />{step.message}</div>;
              }
              if (step.status === 'success') {
                return <div key={i} className="flex items-center"><Check />{step.message}</div>;
              }
              // If fail, don't show icon, just the message in red
              if (step.status === 'fail') {
                return <div key={i} className="flex items-center text-red-400">{step.message}</div>;
              }
            }
            // Error log: if it starts with 'Error en la generación:', '❌' or contains '✖', show in red
            if (step.message.startsWith('Error en la generación:') || 
                step.message.startsWith('❌') || 
                step.message.includes('✖')) {
              return <div key={i} className="flex items-center text-red-400">
                {step.message.replace('❌', '').replace('✖', '').trim()}
              </div>;
            }
            // Log with check (only for messages that don't come from the script)
            if (step.message.includes('✔') && !step.message.includes('[')) {
              return <div key={i} className="flex items-center">{step.message.replace('✔', '').trim()}</div>;
            }
            // Log with celebration emoji (without icon)
            if (step.message.includes('🎉')) {
              return <div key={i}>{step.message}</div>;
            }
            // Script log (text only)
            if (step.message.includes('[')) {
              return <div key={i}>{step.message.replace('✔', '').trim()}</div>;
            }
            // Normal log
            if (step.message.startsWith('Versiones instaladas:') || 
                step.message.includes('Node:') || 
                step.message.includes('Yarn:') || 
                step.message.includes('Ruby:') || 
                step.message.includes('CocoaPods:')) {
              return <div key={i} className="text-white">{step.message}</div>;
            }
            return <div key={i}>{step.message}</div>;
          })
        )}
      </div>
    </div>
  );
}