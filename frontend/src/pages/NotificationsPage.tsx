import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { api } from "../services/api";
import { X } from "lucide-react";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Notification {
  id: number;
  message: string;
  created_at: string;
  is_read: boolean;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications/");
      setNotifications(response.data.results);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/mark_as_read/`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}/`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error(`Error deleting notification: ${error}`);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-4xl font-semibold mb-6">Notifications</h1>
        {notifications.length === 0 ? (
          <p className="text-lg text-gray-600">
            No notifications at the moment.
          </p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className="shadow-lg border border-gray-200"
              >
                <CardHeader className="w-full flex relative justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="absolute right-10 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div>
                    <h2 className="text-base font-medium text-gray-800">
                      {notification.message}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-end">
                  {!notification.is_read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 border-blue-600 hover:border-blue-800"
                    >
                      Mark as read
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
