import React from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function FormProjectConfig() {
  return (
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto</label>
        <Input
          type="text"
          placeholder="my-expo-app"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del package</label>
        <Input
          type="text"
          placeholder="com.example.myexpoapp"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Iconos</label>
        <Input type="file" multiple className="block w-full text-sm text-gray-500" />
        <p className="text-xs text-gray-400 mt-1">Sube los iconos de la app (icon, splash, etc.)</p>
      </div>
      <Button type="submit" className="w-full bg-black text-white font-semibold hover:bg-gray-800 transition">
        Generar App
      </Button>
    </form>
  );
} 