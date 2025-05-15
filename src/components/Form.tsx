import React, { useRef } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ImageFileInput from './ui/ImageFileInput';
import { API_ENDPOINTS } from '../config/api';

interface FormData {
  projectName: string;
  packageName: string;
  iconIos: File | null;
  iconAndroid: File | null;
  iconNotification: File | null;
  iconSplash: File | null;
}

interface FormProps {
  onLog?: (log: string, processId?: string) => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function Form({ onLog, formData, setFormData }: FormProps) {
  // Refs para los inputs file
  const iconIosRef = useRef<HTMLInputElement>(null);
  const iconAndroidRef = useRef<HTMLInputElement>(null);
  const iconNotificationRef = useRef<HTMLInputElement>(null);
  const iconSplashRef = useRef<HTMLInputElement>(null);
  const currentProcessId = useRef<string | null>(null);

  // Función para verificar el estado del proceso
  const checkProcessStatus = async (processId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.LOGS(processId));
      const data = await response.json();
      
      if (data.done) {
        // Verificar si el proceso terminó con éxito (no hay errores en los logs)
        const completedSuccessfully = data.logs.some((log: string) => log.includes('Process completed.'));
        if (completedSuccessfully) {
          window.dispatchEvent(new Event('app-created'));
        }
        return;
      }
      
      // Si el proceso no ha terminado, seguir verificando
      setTimeout(() => checkProcessStatus(processId), 3000);
    } catch (error) {
      console.error('Error checking process status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    let projectName = formData.projectName.trim();
    let packageName = formData.packageName.trim();
    if (!projectName) projectName = 'my-expo-app';
    if (!packageName) packageName = 'com.example.myexpoapp';
    formDataToSend.append('projectName', projectName);
    formDataToSend.append('packageName', packageName);
    if (formData.iconIos) formDataToSend.append('iconIos', formData.iconIos);
    if (formData.iconAndroid) formDataToSend.append('iconAndroid', formData.iconAndroid);
    if (formData.iconNotification) formDataToSend.append('iconNotification', formData.iconNotification);
    if (formData.iconSplash) formDataToSend.append('iconSplash', formData.iconSplash);
    try {
      const res = await fetch(API_ENDPOINTS.GENERATE_APP, {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await res.json();
      if (data.ok && data.id) {
        currentProcessId.current = data.id;
        onLog?.('Process started. Showing logs...', data.id);
        // Iniciar la verificación del estado del proceso
        checkProcessStatus(data.id);
      } else {
        onLog?.('❌ ' + (data.error || 'Unknown error.'));
      }
    } catch (err) {
      onLog?.('❌ Network or backend error.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
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
          value={formData.projectName}
          onChange={handleInputChange}
        />
        <p className="text-xs text-gray-400 mt-1">Este nombre se mostrará debajo del icono de la app.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del package</label>
        <Input
          name="packageName"
          type="text"
          placeholder="com.example.myexpoapp"
          value={formData.packageName}
          onChange={handleInputChange}
        />
        <p className="text-xs text-gray-400 mt-1">Identificador que Google y Apple utilizarán para gestionar la app en sus tiendas.</p>
      </div>
      {/* Icono de App (iOS) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de App (iOS)</label>
        <ImageFileInput 
          id="icon-ios" 
          ref={iconIosRef}
          onChange={(e) => handleFileChange(e, 'iconIos')}
        />
        <p className="text-xs text-gray-400 mt-1">PNG 1024x1024</p>
      </div>
      {/* Icono de App (Android) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de App (Android)</label>
        <ImageFileInput 
          id="icon-android" 
          ref={iconAndroidRef}
          onChange={(e) => handleFileChange(e, 'iconAndroid')}
        />
        <p className="text-xs text-gray-400 mt-1">PNG 1024x1024 <span className="italic">transparente</span></p>
      </div>
      {/* Icono de Splash */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de Splash</label>
        <ImageFileInput 
          id="icon-splash" 
          ref={iconSplashRef}
          onChange={(e) => handleFileChange(e, 'iconSplash')}
        />
        <p className="text-xs text-gray-400 mt-1">PNG 1242x2436 <span className="italic">transparente</span></p>
      </div>
      {/* Icono de Notificación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icono de Notificación</label>
        <ImageFileInput 
          id="icon-notification" 
          ref={iconNotificationRef}
          onChange={(e) => handleFileChange(e, 'iconNotification')}
        />
        <p className="text-xs text-gray-400 mt-1">PNG 96x96</p>
      </div>
      <p className="text-xs text-gray-500 mt-2">Los iconos son opcionales. Si no se proporcionan, se utilizarán los iconos predeterminados de Expo.</p>
    </form>
  );
} 