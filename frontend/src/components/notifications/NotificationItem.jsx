import React from 'react';
import { CheckCircle2, Info, Clock, AlertTriangle, MessageSquare, Pill, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const getIcon = (type) => {
  switch (type) {
    case 'medicine_found':
      return <Pill size={18} className="text-primary" />;
    case 'reservation_confirmed':
      return <CheckCircle2 size={18} className="text-success" />;
    case 'pharmacy_response':
      return <MessageSquare size={18} className="text-blue-500" />;
    case 'reservation_reminder':
      return <Clock size={18} className="text-warning" />;
    case 'emergency_alert':
      return <AlertTriangle size={18} className="text-red-500" />;
    case 'system':
    default:
      return <Info size={18} className="text-slate-500" />;
  }
};

const getIconBg = (type) => {
  switch (type) {
    case 'medicine_found':
      return 'bg-primary/10';
    case 'reservation_confirmed':
      return 'bg-success/10';
    case 'pharmacy_response':
      return 'bg-blue-500/10';
    case 'reservation_reminder':
      return 'bg-warning/10';
    case 'emergency_alert':
      return 'bg-red-500/10';
    case 'system':
    default:
      return 'bg-slate-100';
  }
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const { _id, title, message, type, isRead, createdAt } = notification;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      layout
      className={`relative group flex items-start space-x-4 p-4 border-b border-slate-100 transition-colors hover:bg-slate-50 ${
        isRead ? 'opacity-70' : 'bg-white'
      }`}
    >
      {/* Unread indicator */}
      {!isRead && (
        <span className="absolute top-4 left-1.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
      )}

      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(type)} ml-2`}>
        {getIcon(type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-8">
        <h4 className={`text-sm font-semibold truncate ${!isRead ? 'text-slate-900' : 'text-slate-700'}`}>
          {title}
        </h4>
        <p className="text-sm text-slate-600 line-clamp-2 mt-0.5 leading-snug">
          {message}
        </p>
        <span className="text-xs text-slate-400 font-medium mt-2 block">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Actions */}
      <div className="absolute right-4 top-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isRead && (
          <button 
            onClick={(e) => { e.stopPropagation(); onMarkAsRead(_id); }}
            className="p-1.5 text-slate-400 hover:text-success hover:bg-success/10 rounded-lg transition-colors"
            title="Mark as read"
          >
            <Check size={14} />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(_id); }}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
