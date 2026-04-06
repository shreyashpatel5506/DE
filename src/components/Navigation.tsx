import React from 'react';
import { Moon, Sun, Shield, Users, Home, Info, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthContext';

interface NavigationProps {
  currentView: 'home' | 'citizen' | 'officer' | 'about' | 'contact';
  setCurrentView: (view: 'home' | 'citizen' | 'officer' | 'about' | 'contact') => void;
}

export function Navigation({ currentView, setCurrentView }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, role, logout } = useAuth();

  const handleViewChange = (view: 'home' | 'citizen' | 'officer' | 'about' | 'contact') => {
    setCurrentView(view);
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">CivicReport</span>
            </div>
            
            <div className="hidden lg:flex items-center space-x-2 ml-8">
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('home')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button
                variant={currentView === 'citizen' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('citizen')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Report Issue
              </Button>
              
              <Button
                variant={currentView === 'about' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('about')}
                className="flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                About
              </Button>
              <Button
                variant={currentView === 'contact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('contact')}
                className="flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Contact
              </Button>
              <Button
                variant={currentView === 'officer' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('officer')}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Officers
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="mr-2"
              >
                Logout ({role})
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="lg:hidden pb-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('home')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button
              variant={currentView === 'citizen' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('citizen')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Report
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={currentView === 'officer' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('officer')}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'about' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('about')}
              className="flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              About
            </Button>
            <Button
              variant={currentView === 'contact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('contact')}
              className="flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Contact
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}