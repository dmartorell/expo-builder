import React from 'react';

export default function TerminalLogs() {
  return (
    <div className="h-full overflow-y-auto space-y-2">
      <div className="text-green-400">$ yarn create-app</div>
      <div className="text-white">✔ Proyecto creado correctamente</div>
      <div className="text-red-400">✖ Error: Falta el icono de la app</div>
      <div className="text-yellow-400">⚠ Advertencia: El nombre del package es opcional</div>
    </div>
  );
} 