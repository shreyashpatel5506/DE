import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { IssueSubmissionForm } from './citizen/IssueSubmissionForm';
import { IssueTracker } from './citizen/IssueTracker';
import { CitizenLogin } from './citizen/CitizenLogin';
import { PlusCircle, Search } from 'lucide-react';
import { useAuth } from './AuthContext';

export function CitizenView() {
  const [activeTab, setActiveTab] = useState('submit');
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn || role !== 'user') {
    return <CitizenLogin />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Report Infrastructure Issues
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Help improve your community by reporting infrastructure problems. 
          Track your submissions and get updates on their resolution status.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Submit Issue
          </TabsTrigger>
          <TabsTrigger value="track" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Track Issues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <IssueSubmissionForm />
        </TabsContent>

        <TabsContent value="track" className="space-y-6">
          <IssueTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}