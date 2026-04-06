import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function monthKey(dateInput?: string) {
  if (!dateInput) return 'Unknown';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString('en-US', { month: 'short' });
}

export function Analytics() {
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    const cacheKey = 'officer_analytics_cache';
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setIssues(parsed);
        }
      }
    } catch {
      // ignore cache errors
    }

    const fetchLive = async () => {
      try {
        const response = await api.get('/api/getposts?limit=500&page=1');
        if (!response.data.success) return;
        const posts = response.data.posts || [];
        setIssues(posts);
        localStorage.setItem(cacheKey, JSON.stringify(posts));
      } catch {
        // silent for instant-feel UX
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 15000);
    return () => clearInterval(interval);
  }, []);

  const issuesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    issues.forEach((issue: any) => {
      const category = issue.category || issue.department || 'Other';
      map.set(category, (map.get(category) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, count], index) => ({
      name,
      count,
      color: COLORS[index % COLORS.length],
    }));
  }, [issues]);

  const statusDistribution = useMemo(() => {
    const counts = {
      Pending: 0,
      Verified: 0,
      'In Progress': 0,
      Resolved: 0,
    };

    issues.forEach((issue: any) => {
      const status = issue.status || 'Pending';
      if (status in counts) {
        counts[status as keyof typeof counts] += 1;
      }
    });

    return [
      { name: 'Pending', value: counts.Pending, color: '#6b7280' },
      { name: 'Verified', value: counts.Verified, color: '#3b82f6' },
      { name: 'In Progress', value: counts['In Progress'], color: '#f59e0b' },
      { name: 'Resolved', value: counts.Resolved, color: '#10b981' },
    ];
  }, [issues]);

  const resolutionTrends = useMemo(() => {
    const submittedByMonth = new Map<string, number>();
    const resolvedByMonth = new Map<string, number>();

    issues.forEach((issue: any) => {
      const createdMonth = monthKey(issue.createdAt);
      submittedByMonth.set(createdMonth, (submittedByMonth.get(createdMonth) || 0) + 1);

      if (issue.status === 'Resolved') {
        const resolvedMonth = monthKey(issue.updatedAt || issue.createdAt);
        resolvedByMonth.set(resolvedMonth, (resolvedByMonth.get(resolvedMonth) || 0) + 1);
      }
    });

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return labels.map((month) => ({
      month,
      submitted: submittedByMonth.get(month) || 0,
      resolved: resolvedByMonth.get(month) || 0,
    }));
  }, [issues]);

  const stats = useMemo(() => {
    const total = issues.length;
    const resolved = issues.filter((i: any) => i.status === 'Resolved').length;
    const active = issues.filter((i: any) => i.status !== 'Resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const resolvedWithTimes = issues.filter((i: any) => i.status === 'Resolved' && i.createdAt && i.updatedAt);
    const avgResolutionDays = resolvedWithTimes.length > 0
      ? (resolvedWithTimes.reduce((sum: number, i: any) => {
          const created = new Date(i.createdAt).getTime();
          const updated = new Date(i.updatedAt).getTime();
          const days = Math.max(0, (updated - created) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / resolvedWithTimes.length)
      : 0;

    return [
      {
        title: 'Total Issues',
        value: `${total}`,
        change: `${resolved}`,
        changeType: 'positive',
        icon: AlertTriangle,
        description: 'resolved so far',
      },
      {
        title: 'Avg Resolution Time',
        value: `${avgResolutionDays.toFixed(1)} days`,
        change: `${resolvedWithTimes.length}`,
        changeType: 'positive',
        icon: Clock,
        description: 'resolved issues measured',
      },
      {
        title: 'Resolution Rate',
        value: `${resolutionRate}%`,
        change: `${resolved}/${total || 0}`,
        changeType: 'positive',
        icon: CheckCircle,
        description: 'resolved ratio',
      },
      {
        title: 'Active Issues',
        value: `${active}`,
        change: `${total}`,
        changeType: 'neutral',
        icon: TrendingUp,
        description: 'total tracked',
      },
    ];
  }, [issues]);

  const topCategory = issuesByCategory.slice().sort((a, b) => b.count - a.count)[0];
  const bestStatus = statusDistribution.find((s) => s.name === 'Resolved');

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    stat.changeType === 'positive' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-sm ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>
              Distribution of issues across different infrastructure categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issuesByCategory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-muted-foreground"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>
              Current status breakdown of all issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Resolution Trends</CardTitle>
          <CardDescription>
            Monthly comparison of submitted vs resolved issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={resolutionTrends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-muted-foreground" />
              <YAxis className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="submitted" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Submitted"
              />
              <Line 
                type="monotone" 
                dataKey="resolved" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Resolved"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            Live insights and recommendations based on real issue data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4>Top Performing Areas</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <span className="text-sm">Top Category</span>
                  <span className="text-sm text-green-600 dark:text-green-400">{topCategory ? `${topCategory.name}: ${topCategory.count}` : 'No data yet'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <span className="text-sm">Resolved Issues</span>
                  <span className="text-sm text-green-600 dark:text-green-400">{bestStatus ? bestStatus.value : 0} resolved</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4>Areas for Improvement</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <span className="text-sm">Pending</span>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">{statusDistribution.find((s) => s.name === 'Pending')?.value || 0} pending</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <span className="text-sm">In Progress</span>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">{statusDistribution.find((s) => s.name === 'In Progress')?.value || 0} in progress</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}