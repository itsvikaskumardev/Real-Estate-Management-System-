import React, { createContext, useContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import API_URL from "../config";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    // Only connect if we have a user
    if (!user) {
      if (connection) {
        connection.stop();
        setConnection(null);
      }
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/chatHub`, {
        accessTokenFactory: () => localStorage.getItem("token") || ""
      })
      .withAutomaticReconnect()
      .build();

    let isMounted = true;

    newConnection.start()
      .then(() => {
        if (!isMounted) return; // Prevent joining if component already unmounted (React 18 Strict Mode)

        // Join the global notification group for this specific user
        newConnection.invoke("JoinUserGroup", String(user.id).toLowerCase()).catch(err => console.error("Error joining user group:", err));

        newConnection.on("ReceiveNotification", (notification) => {
          // notification format: { title, message, type, createdAt }
          const { title, message, type } = notification;

          // Configure toast based on type
          const toastOptions = {
            duration: 5000,
            position: 'bottom-right',
            style: {
              background: '#fff',
              color: '#333',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }
          };

          const toastMessage = (
            <div>
              <strong>{title}</strong>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          );

          if (type === "success") toast.success(toastMessage, toastOptions);
          else if (type === "error") toast.error(toastMessage, toastOptions);
          else if (type === "warning") toast(toastMessage, { ...toastOptions, icon: '⚠️' });
          else toast(toastMessage, toastOptions); // default info
        });
      })
      .catch(err => console.error("SignalR Connection Error: ", err));

    setConnection(newConnection);

    return () => {
      isMounted = false;
      newConnection.stop();
    };
  }, [user]); // Re-run if user changes (e.g. login/logout)

  return (
    <NotificationContext.Provider value={{ connection }}>
      {children}
    </NotificationContext.Provider>
  );
};
