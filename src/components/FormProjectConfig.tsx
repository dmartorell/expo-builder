import React from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ImageFileInput from "./ImageFileInput";

export default function FormProjectConfig() {
  return (
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto</label>
        <Input
          type="text"
          placeholder="my-expo-app"
        />
        <p className="text-xs text-gray-400 mt-1">Este nombre se mostrará debajo del icono de la app.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del package</label>
        <Input
          type="text"
          placeholder="com.example.myexpoapp"
        />
        <p className="text-xs text-gray-400 mt-1">Identificador que Google y Apple utilizarán para gestionar la app en sus tiendas.</p>
      </div>
      {/* Icono de App (iOS) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de App (iOS)</label>
        <ImageFileInput id="icon-ios" />
        <p className="text-xs text-gray-400 mt-1">PNG 1024x1024</p>
      </div>
      {/* Icono Adaptativo (Android) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de App (Android)</label>
        <ImageFileInput id="icon-android" />
        <p className="text-xs text-gray-400 mt-1">PNG 1024x1024 <span className="italic">transparente</span></p>
      </div>
      {/* Icono de Splash */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de Splash</label>
        <ImageFileInput id="icon-splash" />
        <p className="text-xs text-gray-400 mt-1">PNG 1242x2436 <span className="italic">transparente</span></p>
      </div>
      {/* Icono de Notificación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de Notificación</label>
        <ImageFileInput id="icon-notification" />
        <p className="text-xs text-gray-400 mt-1">PNG 96x96</p>
      </div>
      <p className="text-xs text-gray-500 mt-2">Los iconos son opcionales. Si no se proporcionan, se utilizarán los iconos Alfred predeterminados.</p>
      <Button type="submit" className="w-full bg-black text-white font-semibold hover:bg-gray-800 transition">
        Generar App
      </Button>
    </form>
  );
} 