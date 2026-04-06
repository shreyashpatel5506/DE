import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { IssueManagement } from './IssueManagement';
import { Analytics } from './Analytics';
import { LogOut, BarChart3, Settings } from 'lucide-react';

interface OfficerDashboardProps {
  onLogout: () => void;
}

export function OfficerDashboard({ onLogout }: OfficerDashboardProps) {
  const [activeTab, setActiveTab] = useState('issues');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="mb-2">Infrastructure Management Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track citizen-reported infrastructure issues
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onLogout}
          className="flex items-center gap-2 self-start"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Issue Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issues">
          <IssueManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}