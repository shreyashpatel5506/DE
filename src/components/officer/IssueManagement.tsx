import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Search, Filter, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

type Issue = {
  id: string;
  title: string;
  category: string;
  location: string;
  status: 'Pending' | 'Verified' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  submittedDate: string;
  assignedTo: string;
  description: string;
  citizenContact: string;
};

const statusConfig: Record<Issue['status'], { color: string; label: string }> = {
  Pending: { color: 'bg-gray-500', label: 'Pending' },
  Verified: { color: 'bg-blue-500', label: 'Verified' },
  'In Progress': { color: 'bg-yellow-500', label: 'In Progress' },
  Resolved: { color: 'bg-green-500', label: 'Resolved' },
};

const priorityConfig: Record<Issue['priority'], { color: string; label: string }> = {
  Low: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Low' },
  Medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Medium' },
  High: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'High' },
  Critical: { color: 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-200', label: 'Critical' },
};

export function IssueManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const cacheKey = 'officer_issue_management_cache';

  const hydrateCache = () => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setIssues(parsed);
      }
    } catch {
      // ignore cache errors
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await api.get('/api/getposts?limit=200&page=1');
      if (!response.data.success) {
        toast.error('Failed to fetch live issues');
        return;
      }

      const mapped: Issue[] = (response.data.posts || []).map((post: any) => ({
        id: String(post._id),
        title: post.title || 'Untitled',
        category: post.category || post.department || 'Other',
        location: post.location || 'Unknown',
        status: (post.status || 'Pending') as Issue['status'],
        priority: (post.priority || 'Low') as Issue['priority'],
        submittedDate: post.createdAt || new Date().toISOString(),
        assignedTo: `${post.department || post.category || 'Operations'} Team`,
        description: post.description || 'No description provided',
        citizenContact: post.createdUser?.email || 'N/A',
      }));

      setIssues(mapped);
      localStorage.setItem(cacheKey, JSON.stringify(mapped));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not fetch issues');
    }
  };

  useEffect(() => {
    hydrateCache();
    fetchIssues();
    const interval = setInterval(fetchIssues, 12000);
    return () => clearInterval(interval);
  }, []);

  const filteredIssues = useMemo(() => issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  }), [issues, searchQuery, statusFilter, categoryFilter]);

  const updateIssueStatus = async (issueId: string, newStatus: Issue['status']) => {
    const previousIssues = issues;
    setIssues((prev) => prev.map((issue) => (
      issue.id === issueId
        ? { ...issue, status: newStatus }
        : issue
    )));

    if (selectedIssue?.id === issueId) {
      setSelectedIssue({ ...selectedIssue, status: newStatus });
    }

    try {
      const response = await api.patch(`/api/updateStatus?id=${issueId}`, {
        status: newStatus,
      }, {
        headers: { role: 'officer' },
      });

      if (!response.data.success) {
        setIssues(previousIssues);
        toast.error(response.data.message || 'Status update failed');
        return;
      }

      toast.success(`Issue status updated to ${newStatus}`);
    } catch (error: any) {
      setIssues(previousIssues);
      toast.error(error.response?.data?.message || 'Could not update status');
    }
  };

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'Pending': return <AlertTriangle className="w-4 h-4" />;
      case 'Verified': return <Eye className="w-4 h-4" />;
      case 'In Progress': return <Clock className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const categories = [...new Set(issues.map(issue => issue.category))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>
            Live data from backend. Filter and manage citizen-reported issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Search Issues</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, title, or location..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issues Overview ({filteredIssues.length})</CardTitle>
          <CardDescription>
            Manage and update live issue status from your backend API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map(issue => (
                  <TableRow key={issue.id}>
                      <TableCell className="font-mono">#{issue.id.slice(-6)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{issue.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{issue.location}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{issue.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[issue.status].color} text-white`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(issue.status)}
                            {statusConfig[issue.status].label}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityConfig[issue.priority].color}>
                          {priorityConfig[issue.priority].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(issue.submittedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedIssue(issue)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Issue #{issue.id.slice(-6)} Details</DialogTitle>
                                <DialogDescription>
                                  {issue.title}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm">Category</label>
                                    <p>{issue.category}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm">Priority</label>
                                    <Badge variant="outline" className={priorityConfig[issue.priority].color}>
                                      {priorityConfig[issue.priority].label}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm">Location</label>
                                    <p>{issue.location}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm">Assigned To</label>
                                    <p>{issue.assignedTo}</p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm">Description</label>
                                  <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                                </div>

                                <div>
                                  <label className="text-sm">Reporter Contact</label>
                                  <p className="text-sm text-muted-foreground mt-1">{issue.citizenContact}</p>
                                </div>

                                <div>
                                  <label className="text-sm">Update Status</label>
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {(Object.keys(statusConfig) as Issue['status'][]).map((statusKey) => (
                                      <Button
                                        key={statusKey}
                                        variant={issue.status === statusKey ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => updateIssueStatus(issue.id, statusKey)}
                                        disabled={issue.status === statusKey}
                                      >
                                        {statusConfig[statusKey].label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">No Issues Found</h3>
              <p className="text-muted-foreground">
                No live issues match your current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
