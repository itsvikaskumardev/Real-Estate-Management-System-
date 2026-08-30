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
    let newConnection = null;

    if (user && activeChat) {
      newConnection = new HubConnectionBuilder()
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
        .then(() => {
          console.log("Connected to SignalR ChatHub");
          
          // Automatically join the SignalR group for this chat
          const chatId = activeChat.id || activeChat._id;
          if (chatId) {
             newConnection.invoke("JoinChat", String(chatId)).catch(err => console.error("Error joining chat:", err));
          }
        })
        .catch((err) => console.error("Error connecting to ChatHub:", err));
    } else {
      setSocket(null);
    }

    // Cleanup: Disconnect when the user leaves the chat or unmounts (Strict Mode duplicate prevention)
    return () => {
      if (newConnection) {
        newConnection.stop().then(() => console.log("Disconnected from SignalR ChatHub"));
      }
    };
  }, [user, activeChat]);

  const joinChat = (chatId) => {
    // This is now handled automatically in the useEffect above when activeChat is set.
    // Keeping this function for backwards compatibility if any component calls it directly,
    // though the socket might not be fully connected yet when they call it.
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
