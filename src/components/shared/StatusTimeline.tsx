import React from 'react';
import { ISSUE_STATUS_FLOW, type IssueStatus } from '@/lib/constants';

type StatusTimelineProps = {
  status?: string;
};

export function StatusTimeline({ status = 'Pending' }: StatusTimelineProps) {
  const safeStatus: IssueStatus = (ISSUE_STATUS_FLOW as readonly string[]).includes(status)
    ? (status as IssueStatus)
    : 'Pending';

  const currentIndex = ISSUE_STATUS_FLOW.indexOf(safeStatus);

  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      {ISSUE_STATUS_FLOW.map((step, index) => {
        const completed = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex min-w-0 flex-1 flex-col items-center">
            <div
              className={`mb-1 h-3 w-3 rounded-full border-2 transition-all duration-300 ${
                completed
                  ? 'border-blue-600 bg-blue-600 dark:border-green-500 dark:bg-green-500'
                  : 'border-muted-foreground/40 bg-background'
              } ${isCurrent ? 'ring-2 ring-blue-500/30 dark:ring-green-400/30' : ''}`}
            />
            <span className={`text-[10px] sm:text-xs ${isCurrent ? 'text-primary font-medium' : ''}`}>
              {step === 'Pending' ? 'Submitted' : step}
            </span>
          </div>
        );
      })}
    </div>
  );
}