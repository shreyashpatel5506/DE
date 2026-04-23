import React, { useState } from 'react';
import { Shield, Users, Home, Info, Phone, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface NavigationProps {
  currentView: 'home' | 'citizen' | 'officer' | 'about' | 'contact';
  setCurrentView: (view: 'home' | 'citizen' | 'officer' | 'about' | 'contact') => void;
}

export function Navigation({ currentView, setCurrentView }: NavigationProps) {
  const { isLoggedIn, role, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead, clearNotifications } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleViewChange = (view: 'home' | 'citizen' | 'officer' | 'about' | 'contact') => {
    setCurrentView(view);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-cyan-300/15 bg-black/35 shadow-[0_8px_32px_-12px_rgba(34,211,238,0.45)] backdrop-blur-xl supports-[backdrop-filter]:bg-black/25">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">CivicReport</span>
            </div>
            
            <div className="hidden lg:flex items-center space-x-2 ml-8">
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('home')}
                className="cursor-hit flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-400/10"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button
                variant={currentView === 'citizen' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('citizen')}
                className="cursor-hit flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-400/10"
              >
                <Users className="w-4 h-4" />
                Report Issue
              </Button>
              
              <Button
                variant={currentView === 'about' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('about')}
                className="cursor-hit flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-400/10"
              >
                <Info className="w-4 h-4" />
                About
              </Button>
              <Button
                variant={currentView === 'contact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('contact')}
                className="cursor-hit flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-400/10"
              >
                <Phone className="w-4 h-4" />
                Contact
              </Button>
              <Button
                variant={currentView === 'officer' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('officer')}
                className="cursor-hit flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-400/10"
              >
                <Shield className="w-4 h-4" />
                Officers
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isLoggedIn && role === 'user' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotificationsOpen(true)}
                className="cursor-hit relative p-2"
                title="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full flex items-center justify-center text-[10px] bg-blue-600 text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            )}

            <Dialog
              open={isNotificationsOpen}
              onOpenChange={(open) => {
                setIsNotificationsOpen(open);
                if (open) markAllRead();
              }}
            >
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>All Notifications</DialogTitle>
                  <DialogDescription>
                    Updates for your reported issues.
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="rounded-md border px-4 py-8 text-center text-sm text-muted-foreground">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n, index) => (
                      <div
                        key={`${n.id}-${index}`}
                        className={`rounded-md border px-3 py-3 text-sm cursor-pointer ${n.read ? 'opacity-75' : 'bg-blue-500/5 border-blue-400/30'}`}
                        onClick={() => markRead(n.id)}
                        title="Mark as read"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{n.title || 'Issue Update'}</p>
                            <p className="text-muted-foreground mt-1">{n.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Report ID: {n.postId}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(n.at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={markAllRead}>
                    Mark all read
                  </Button>
                  <Button variant="destructive" size="sm" onClick={clearNotifications}>
                    Clear all
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="cursor-hit mr-2 border-cyan-300/30 bg-cyan-500/5 hover:bg-cyan-500/10"
              >
                Logout ({role})
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="lg:hidden pb-4">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('home')}
              className="cursor-hit flex shrink-0 items-center gap-2 snap-start"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button
              variant={currentView === 'citizen' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('citizen')}
              className="cursor-hit flex shrink-0 items-center gap-2 snap-start"
            >
              <Users className="w-4 h-4" />
              Report
            </Button>
            <Button
              variant={currentView === 'officer' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('officer')}
              className="cursor-hit flex shrink-0 items-center gap-2 snap-start"
            >
              <Shield className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'about' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('about')}
              className="cursor-hit flex shrink-0 items-center gap-2 snap-start"
            >
              <Info className="w-4 h-4" />
              About
            </Button>
            <Button
              variant={currentView === 'contact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('contact')}
              className="cursor-hit flex shrink-0 items-center gap-2 snap-start"
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