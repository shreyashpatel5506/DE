import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

type MetricCardProps = {
  title: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'primary' | 'success';
};

export function MetricCard({ title, value, hint, icon: Icon, tone = 'primary' }: MetricCardProps) {
  return (
    <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
          <div
            className={`rounded-lg p-2 ${
              tone === 'success'
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}