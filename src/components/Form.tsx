import React, { useRef } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ImageFileInput from './ui/ImageFileInput';

interface FormProps {
  onLog?: (log: string, processId?: string) => void;
}

export default function Form({ onLog }: FormProps) {
  // Refs para los inputs file
  const iconIosRef = useRef<HTMLInputElement>(null);
  const iconAndroidRef = useRef<HTMLInputElement>(null);
  const iconNotificationRef = useRef<HTMLInputElement>(null);
  const iconSplashRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData();
    let projectName = form['projectName'].value.trim();
    let packageName = form['packageName'].value.trim();
    if (!projectName) projectName = 'my-expo-app';
    if (!packageName) packageName = 'com.example.myexpoapp';
    formData.append('projectName', projectName);
    formData.append('packageName', packageName);
    if (iconIosRef.current?.files?.[0]) formData.append('iconIos', iconIosRef.current.files[0]);
    if (iconAndroidRef.current?.files?.[0]) formData.append('iconAndroid', iconAndroidRef.current.files[0]);
    if (iconNotificationRef.current?.files?.[0]) formData.append('iconNotification', iconNotificationRef.current.files[0]);
    if (iconSplashRef.current?.files?.[0]) formData.append('iconSplash', iconSplashRef.current.files[0]);
    try {
      const res = await fetch('http://localhost:4000/api/generate-app', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.ok && data.id) {
        onLog?.('Proceso iniciado. Mostrando logs...', data.id);
      } else {
        onLog?.('❌ ' + (data.error || 'Error desconocido.'));
      }
    } catch (err) {
      onLog?.('❌ Error de red o backend.');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Configura tu proyecto</h2>
        <Button type="submit" className="bg-black text-white font-semibold hover:bg-gray-800 transition">
          Generar App
        </Button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto</label>
        <Input
          name="projectName"
          type="text"
          placeholder="my-expo-app"
        />
        <p className="text-xs text-gray-400 mt-1">Este nombre se mostrará debajo del icono de la app.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del package</label>
        <Input
          name="packageName"
          type="text"
          placeholder="com.example.myexpoapp"
        />
        <p className="text-xs text-gray-400 mt-1">Identificador que Google y Apple utilizarán para gestionar la app en sus tiendas.</p>
      </div>
      {/* Icono de App (iOS) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de App (iOS)</label>
        <ImageFileInput id="icon-ios" ref={iconIosRef} />
        <p className="text-xs text-gray-400 mt-1">PNG 1024x1024</p>
      </div>
      {/* Icono de App (Android) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de App (Android)</label>
        <ImageFileInput id="icon-android" ref={iconAndroidRef} />
        <p className="text-xs text-gray-400 mt-1">PNG 1024x1024 <span className="italic">transparente</span></p>
      </div>
      {/* Icono de Splash */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de Splash</label>
        <ImageFileInput id="icon-splash" ref={iconSplashRef} />
        <p className="text-xs text-gray-400 mt-1">PNG 1242x2436 <span className="italic">transparente</span></p>
      </div>
      {/* Icono de Notificación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de Notificación</label>
        <ImageFileInput id="icon-notification" ref={iconNotificationRef} />
        <p className="text-xs text-gray-400 mt-1">PNG 96x96</p>
      </div>
      <p className="text-xs text-gray-500 mt-2">Los iconos son opcionales. Si no se proporcionan, se utilizarán los iconos Alfred predeterminados.</p>
    </form>
  );
} 