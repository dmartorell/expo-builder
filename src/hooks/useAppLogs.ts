import { useCallback, useEffect, useRef, useState } from "react";

export const useAppLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastLogCountRef = useRef<number>(0);

  const startPolling = useCallback((id: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    lastLogCountRef.current = 0;
    pollingRef.current = setInterval(async () => {
      const res = await fetch(`http://localhost:4000/api/logs/${id}`);
      const data = await res.json();
      if (data.ok) {
        if (data.logs.length > lastLogCountRef.current) {
          const newLogs = data.logs.slice(lastLogCountRef.current);
          setLogs(prev => [...prev, ...newLogs]);
          lastLogCountRef.current = data.logs.length;
        }
        if (data.done) {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
        }
      }
    }, 1000);
  }, []);

  const handleLog = useCallback((log: string, processIdFromForm?: string) => {
    setLogs(prev => [...prev, log]);
    if (processIdFromForm) {
      startPolling(processIdFromForm);
    }
  }, [startPolling]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return { logs, setLogs, handleLog };
}