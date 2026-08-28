import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useAuth } from "./AuthContext";
import API_URL from "../config";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const activeChatRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    setActiveChat(null);
    setNotifications([]);
  }, [user]);

  useEffect(() => {
    if (user) {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`${API_URL}/chatHub`)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      setSocket(newConnection);

      newConnection.on("receiveMessage", (data) => {
        if ((activeChatRef.current?.id || activeChatRef.current?._id) !== (data.chatId || data.chat?.id)) {
          setNotifications((prev) => {
            if (prev.some((m) => (m.id || m._id) === (data.id || data._id))) return prev;
            return [...prev, data];
          });
        }
      });

      newConnection.start()
        .then(() => console.log("Connected to SignalR ChatHub"))
        .catch((err) => console.error("Error connecting to ChatHub:", err));

      return () => {
        newConnection.stop();
      };
    }
  }, [user]);

  const joinChat = (chatId) => {
    if (socket && socket.state === "Connected") {
      socket.invoke("JoinChat", String(chatId)).catch(err => console.error(err));
    }
  };

  const sendMessage = (
    chatId,
    text,
    messageId = null,
    createdAt = new Date(),
    image = null,
  ) => {
    if (socket && user) {
      const messageData = {
        chatId,
        sender: user._id,
        text,
        image,
        createdAt,
        _id: messageId,
      };

      // Message is broadcasted via HTTP POST in the backend, no need to invoke SignalR here.

      return messageData;
    }
    return null;
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        activeChat,
        setActiveChat,
        joinChat,
        sendMessage,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
