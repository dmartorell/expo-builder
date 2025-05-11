import React from 'react';

export default function FormProjectConfig() {
  return (
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="my-expo-app"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del package</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="com.example.myexpoapp"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Iconos</label>
        <input type="file" multiple className="block w-full text-sm text-gray-500" />
        <p className="text-xs text-gray-400 mt-1">Sube los iconos de la app (icon, splash, etc.)</p>
      </div>
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
      >
        Generar App
      </button>
    </form>
  );
} 