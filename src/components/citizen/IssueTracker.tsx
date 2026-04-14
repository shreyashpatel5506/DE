import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Search, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { api } from '../../lib/api';
import { useNotifications } from '../NotificationContext';
import { StatusTimeline } from '../shared/StatusTimeline';

const statusConfig = {
  Pending: { color: 'bg-gray-500', label: 'Submitted', textColor: 'text-gray-100', progress: 10 },
  Verified: { color: 'bg-blue-500', label: 'Verified', textColor: 'text-blue-100', progress: 25 },
  "In Progress": { color: 'bg-yellow-500', label: 'In Progress', textColor: 'text-yellow-100', progress: 75 },
  Resolved: { color: 'bg-green-500', label: 'Resolved', textColor: 'text-green-100', progress: 100 }
};

export function IssueTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState<any[]>([]);
  const { userId } = useAuth();
  const { notifications, markRead } = useNotifications();

  useEffect(() => {
    const cacheKey = userId ? `issue_tracker_cache_${userId}` : '';

    if (cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setIssues(parsed);
          }
        }
      } catch {
        // ignore bad cache
      }
    }

    const fetchIssues = async () => {
      try {
        const response = await api.get('/api/getposts');
        if (response.data.success) {
          const userIssues = response.data.posts.filter((post: any) => post.createdUser?._id === userId);
          setIssues(userIssues);
          if (cacheKey) {
            localStorage.setItem(cacheKey, JSON.stringify(userIssues));
          }
        }
      } catch (e) {
        console.error("Failed to fetch issues", e);
      }
    };

    if (userId) {
      fetchIssues();
      const interval = setInterval(() => fetchIssues(), 15000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue._id.includes(searchQuery) ||
    issue.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Status Notifications</CardTitle>
            <CardDescription>In-app updates when your issue status changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.map((n, index) => (
                <div
                  key={`${n.id}-${index}`}
                  className={`rounded-md border px-3 py-2 text-sm flex justify-between cursor-pointer ${n.read ? 'opacity-70' : ''}`}
                  onClick={() => markRead(n.id)}
                  title="Mark as read"
                >
                  <span>{n.message}</span>
                  <span className="text-muted-foreground">{new Date(n.at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Track Your Issues</CardTitle>
          <CardDescription>
            Search and monitor the status of your submitted infrastructure issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by issue ID, title, or category..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">No Issues Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms.' : 'You haven\'t submitted any issues yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredIssues.map((issue: any) => {
            const currentStatus = issue.status || 'Pending';
            const progressValue = Array.isArray(statusConfig) ? 10 : (statusConfig[currentStatus as keyof typeof statusConfig]?.progress || 10);
            
            return (
              <Card key={issue._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Issue #{issue._id.substring(issue._id.length - 4)}
                        <Badge 
                          className={`${statusConfig[currentStatus as keyof typeof statusConfig]?.color} ${statusConfig[currentStatus as keyof typeof statusConfig]?.textColor}`}
                        >
                          {statusConfig[currentStatus as keyof typeof statusConfig]?.label || currentStatus}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {issue.title}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        Submitted: {new Date(issue.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {issue.location}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {issue.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="text-muted-foreground">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                    
                    <StatusTimeline status={currentStatus} />
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <Badge variant="outline">{issue.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Last updated: {new Date(issue.updatedAt || issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}