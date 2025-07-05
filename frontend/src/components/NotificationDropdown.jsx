import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaBell, FaCheckCircle, FaCommentDots, FaShoppingCart, FaStar, FaExclamationCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const notificationIcons = {
  chat: <FaCommentDots className="text-blue-500" />,
  purchase: <FaShoppingCart className="text-green-500" />,
  review: <FaStar className="text-yellow-500" />,
  alert: <FaExclamationCircle className="text-red-500" />,
  default: <FaBell className="text-gray-400" />,
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isOpen) fetchNotifications();
    // Click outside to close
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, { withCredentials: true });
      setNotifications(res.data.notifications || []);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {}, { withCredentials: true });
      setNotifications(notifications => notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {}, { withCredentials: true });
      setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const clearAll = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/notifications/clear`, { withCredentials: true });
      setNotifications([]);
    } catch {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:bg-gray-100 rounded-xl group"
        aria-label="Notifications"
      >
        <FaBell className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="dropdown animate-scale-in w-80">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Notifications</h3>
            <span className="badge badge-primary">{unreadCount} unread</span>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <FaCheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                <div className="text-gray-500">No notifications yet</div>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${n.read ? 'bg-gray-50' : 'bg-blue-50/50 border-l-4 border-blue-400'}`}
                  >
                    <div className="mt-1">
                      {notificationIcons[n.type] || notificationIcons.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 line-clamp-2">{n.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    {!n.read && (
                      <button
                        className="ml-2 text-xs text-blue-600 hover:underline"
                        onClick={() => markAsRead(n._id)}
                      >
                        Mark as read
                      </button>
                    )}
                    {n.link && (
                      <Link to={n.link} className="ml-2 text-xs text-blue-500 hover:underline">View</Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center gap-4 justify-between">
            <button className="btn btn-secondary text-xs" onClick={markAllAsRead}>Mark all as read</button>
            <button className="btn btn-danger text-xs" onClick={clearAll}>Clear all</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 