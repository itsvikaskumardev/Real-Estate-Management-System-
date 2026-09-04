import React, { useState, useEffect, useRef } from "react";
import { HiOutlineBell } from "react-icons/hi";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { token, user } = useAuth();
  const { connection } = useNotification();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!connection) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    connection.on("ReceiveNotification", handleNewNotification);
    
    return () => {
      connection.off("ReceiveNotification", handleNewNotification);
    };
  }, [connection]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (id = null) => {
    try {
      let url = `${API_URL}/api/notifications/mark-read`;
      if (id) url += `?id=${id}`;
      
      await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      
      setNotifications(prev => prev.map(n => 
        (id === null || n.id === id) ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: "transparent", border: "none", cursor: "pointer", position: "relative", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}
      >
        <HiOutlineBell size={24} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "4px", right: "4px", backgroundColor: "#ef4444", color: "white", fontSize: "10px", fontWeight: "bold", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute", top: "100%", right: 0, width: "320px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", zIndex: 50, border: "1px solid #e2e8f0", overflow: "hidden", marginTop: "8px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead()}
                style={{ background: "none", border: "none", fontSize: "12px", color: "#059669", cursor: "pointer", fontWeight: "500" }}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div style={{ maxHeight: "350px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                  style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", backgroundColor: notif.isRead ? "white" : "#f0fdf4", cursor: notif.isRead ? "default" : "pointer", transition: "background-color 0.2s" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "600", fontSize: "13px", color: "#0f172a" }}>{notif.title}</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.4" }}>{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
