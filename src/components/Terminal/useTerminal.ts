import { API_ENDPOINTS } from '@/config/api';
import { useRef, useEffect, useMemo, Dispatch, SetStateAction } from 'react';

// Types
export interface Step {
  type: 'spinner' | 'log';
  status?: 'start' | 'success' | 'fail';
  message: string;
}

// Utility functions
export const cleanAnsiCodes = (text: string) => {
  return text.replace(/\[\d+m/g, '').replace(/\[39m/g, '');
};

interface UseTerminalProps {
  logs: string[];
  setLogs: Dispatch<SetStateAction<string[]>>;
  loadSystemVersions?: boolean;
}

export function useTerminal({ logs, setLogs, loadSystemVersions = true }: UseTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const versionsLoadedRef = useRef(false);

  // Auto-scroll effect
  useEffect(() => {
    if (containerRef.current && logs.length > 0) {
      // Use requestAnimationFrame to ensure DOM has been updated
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }
  }, [logs]);

  // Scroll handler to propagate to parent
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    // Only scroll the main page if there are logs and we're near the end
    if (logs.length > 0) {
      const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
      if (isNearBottom) {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  // Process logs into steps
  const steps = useMemo(() => {
    const result: Step[] = [];
    let lastLog = ''; // To avoid consecutive duplicates
    
    logs.forEach((log) => {
      // Only avoid consecutive duplicates
      if (log === lastLog) return;
      lastLog = log;

      // Clean ANSI codes from the log
      const cleanLog = cleanAnsiCodes(log);

      if (cleanLog.startsWith('SPINNER_START:')) {
        // If there's an active spinner, mark it as fail (or close it in another way)
        const lastSpinner = [...result].reverse().find(s => s.type === 'spinner' && s.status === 'start');
        if (lastSpinner) {
          lastSpinner.status = 'fail';
        }
        const newSpinner: Step = { type: 'spinner', status: 'start', message: cleanLog.replace('SPINNER_START:', '').trim() };
        result.push(newSpinner);
      } else if (cleanLog.startsWith('SPINNER_SUCCESS:')) {
        // Mark the last active spinner as success
        const lastSpinner = [...result].reverse().find(s => s.type === 'spinner' && s.status === 'start');
        if (lastSpinner) {
          lastSpinner.status = 'success';
        }
      } else if (cleanLog.startsWith('SPINNER_FAIL:')) {
        // Mark the last active spinner as fail
        const lastSpinner = [...result].reverse().find(s => s.type === 'spinner' && s.status === 'start');
        if (lastSpinner) {
          lastSpinner.status = 'fail';
        }
      } else {
        // Normal log
        result.push({ type: 'log', message: cleanLog });
      }
    });
    return result;
  }, [logs]);

  // Effect to fetch system versions
  useEffect(() => {
    if (!loadSystemVersions || versionsLoadedRef.current) return;

    const fetchSystemVersions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SYSTEM_VERSIONS);
        const versions = await response.json();
        setLogs(prevLogs => {
          // Only add versions if they're not already in the logs
          if (!prevLogs.some(log => log.includes('Versiones instaladas'))) {
            return [
              'Versiones instaladas:',
              `Node: ${versions.node}`,
              `Yarn: ${versions.yarn}`,
              `Ruby: ${versions.ruby}`,
              `CocoaPods: ${versions.cocoapods}`,
              ' ',
              ...prevLogs.map(log => log.startsWith('Versiones instaladas:') ? `text-white ${log}` : log)
            ];
          }
          return prevLogs;
        });
        versionsLoadedRef.current = true;
      } catch (error) {
        console.error('Error fetching versions:', error);
      }
    };

    fetchSystemVersions();
  }, [setLogs, loadSystemVersions]);

  const handleClear = () => {
    setLogs([]);
  };

  return {
    containerRef,
    handleScroll,
    steps,
    handleClear,
    hasLogs: logs.length > 0
  };
}