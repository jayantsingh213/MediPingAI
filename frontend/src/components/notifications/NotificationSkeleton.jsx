import React from 'react';

const NotificationSkeleton = () => {
  return (
    <div className="flex items-start space-x-4 p-4 border-b border-slate-100 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/4 mt-2"></div>
      </div>
    </div>
  );
};

export default NotificationSkeleton;
