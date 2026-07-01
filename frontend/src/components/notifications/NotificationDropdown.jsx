import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckSquare, Trash2, Filter, Loader2 } from 'lucide-react';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';

const TABS = ['All', 'Unread', 'Reservations', 'Emergency', 'System'];

const NotificationDropdown = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('All');
  const queryClient = useQueryClient();

  // Fetch Notifications
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.notifications || [];
    }
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/notifications/read/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/notifications/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const notifications = data || [];

  // Filtering
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Unread') return !n.isRead;
    if (activeTab === 'Reservations') return n.type === 'reservation_confirmed' || n.type === 'reservation_reminder';
    if (activeTab === 'Emergency') return n.type === 'emergency_alert';
    if (activeTab === 'System') return n.type === 'system';
    return true; // All
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div 
      className="absolute right-0 mt-4 w-[380px] max-h-[85vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 origin-top-right"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-slate-800 text-lg font-display">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50"
            title="Mark all as read"
          >
            <CheckSquare size={18} />
          </button>
          <button 
            onClick={() => clearAllMutation.mutate()}
            disabled={notifications.length === 0 || clearAllMutation.isPending}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Clear all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-2 pt-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex overflow-x-auto hide-scrollbar space-x-1 pb-2 px-3">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:bg-slate-100/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto bg-white min-h-[300px]">
        {isLoading ? (
          <div>
            {[1, 2, 3, 4].map(i => <NotificationSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-6">
            <Filter size={32} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">Failed to load notifications</p>
            <button onClick={() => queryClient.invalidateQueries(['notifications'])} className="text-primary text-sm mt-2 font-medium">Try again</button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-6">
            <Bell size={32} className="text-slate-200 mb-3" />
            <h4 className="text-slate-700 font-semibold mb-1">All caught up!</h4>
            <p className="text-sm text-slate-500">
              {activeTab === 'All' ? "You don't have any notifications right now." : `No ${activeTab.toLowerCase()} notifications found.`}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredNotifications.map((notif) => (
              <NotificationItem 
                key={notif._id} 
                notification={notif} 
                onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 shrink-0 text-center">
        <button onClick={onClose} className="text-xs text-slate-500 font-medium hover:text-slate-800 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
