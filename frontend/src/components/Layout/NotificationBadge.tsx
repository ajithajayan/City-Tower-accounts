import React from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';

interface NotificationBadgeProps {
  className?: string;
}

const fetchUnreadNotifications = async () => {
  const response = await api.get("/notifications/unread/");
  return response.data.length;
};

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = "" }) => {
  const location = useLocation();

  const { data: unreadCount = 0 } = useQuery(
    ['unreadNotifications'], // Cache key
    fetchUnreadNotifications, // Fetch function
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 60000, // Data considered fresh for 1 minute
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  if (unreadCount === 0 || location.pathname === '/notifications') return null;

  return (
    <span className={`bg-red-500 text-white text-xs font-bold rounded-full px-1 ${className}`}>
      {unreadCount}
    </span>
  );
};

export default NotificationBadge;
