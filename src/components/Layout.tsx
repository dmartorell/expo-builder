import React, { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ExpoIcon } from './ui/icons/ExpoIcon';

export default function Layout({
  dashboardContent,
  documentationContent,
  defaultTab = 'dashboard',
}: {
  dashboardContent: ReactNode;
  documentationContent: ReactNode;
  defaultTab?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con logo de Expo */}
      <header className="px-8 py-6 border-b bg-white flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <ExpoIcon />
          Expo Builder
        </h1>
        <nav>{/* Aquí puedes añadir navegación si lo necesitas */}</nav>
      </header>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="px-8 pt-6">
        <div className="flex justify-end">
          <TabsList className="flex gap-2 bg-transparent p-0 border-none shadow-none">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:shadow-none rounded-full px-6 py-2 text-base text-gray-500 font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 bg-transparent border-none shadow-none"
            >
              Builder
            </TabsTrigger>
            <TabsTrigger
              value="documentation"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:shadow-none rounded-full px-6 py-2 text-base text-gray-500 font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 bg-transparent border-none shadow-none"
            >
              Documentación
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="dashboard">
          {dashboardContent}
        </TabsContent>
        <TabsContent value="documentation">
          {documentationContent}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Expo Builder
          </p>
        </div>
      </footer>
    </div>
  );
} 