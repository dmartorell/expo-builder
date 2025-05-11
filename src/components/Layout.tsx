import React, { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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
          <svg width="32" height="32" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="128" cy="128" r="128" fill="#000" />
            <path d="M128 60L196 196H60L128 60Z" fill="#fff"/>
          </svg>
          Expo App Generator
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
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="documentation"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:shadow-none rounded-full px-6 py-2 text-base text-gray-500 font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 bg-transparent border-none shadow-none"
            >
              Documentation
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
    </div>
  );
} 