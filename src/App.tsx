'use client';

import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { CitizenView } from './components/CitizenView';
import { OfficerView } from './components/OfficerView';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/AuthContext';
import { NotificationProvider } from './components/NotificationContext';
import { Toaster } from 'sonner';

function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'citizen' | 'officer' | 'about' | 'contact'>('home');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'citizen':
        return <CitizenView />;
      case 'officer':
        return <OfficerView />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div key={currentView} className="animate-in fade-in duration-300 slide-in-from-bottom-1">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
          <Toaster richColors position="top-right" />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 