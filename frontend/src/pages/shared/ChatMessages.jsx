import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import {
  HiChevronLeft,
  HiOutlineChatAlt2,
  HiPaperAirplane,
  HiOutlineTrash,
} from "react-icons/hi";
import { chatMessagesStyles as s } from "../../assets/dummyStyles";

const ChatMessages = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const { socket, activeChat, setActiveChat, joinChat, sendMessage } =
    useChat();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatToDelete, setChatToDelete] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/chat/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedConversations = res.data;
        setConversations(fetchedConversations);

        if (location.state?.chat) {
          const existingChat = fetchedConversations.find(
            (c) => (c.id || c._id) === (location.state.chat.id || location.state.chat._id),
          );
          if (existingChat) {
            setActiveChat(existingChat);
          } else {
            setActiveChat(location.state.chat);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user, location.state]);

  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/chat/${activeChat.id || activeChat._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessages(res.data.messages || []);
          joinChat(activeChat.id || activeChat._id);
          scrollToBottom();
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      };
      fetchMessages();
    }
  }, [activeChat]);

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (data) => {
        if (activeChat && data.chatId === (activeChat.id || activeChat._id)) {
          setMessages((prev) => {
            if (prev.some((m) => (m.id || m._id) === (data.id || data._id))) return prev;
            return [...prev, data];
          });
        }
      });
    }
    return () => socket?.off("receiveMessage");
  }, [socket, activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeChat) {
      const timer = setTimeout(() => scrollToBottom(), 100);
      return () => clearTimeout(timer);
    }
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const textToSend = newMessage;
    setNewMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/api/chat/send`,
        {
          chatId: activeChat.id || activeChat._id,
          text: textToSend,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.newMessage) {
        setMessages((prev) => {
          if (prev.some((m) => (m.id || m._id) === (res.data.newMessage.id || res.data.newMessage._id))) return prev;
          return [...prev, res.data.newMessage];
        });

        sendMessage(
          activeChat.id || activeChat._id,
          textToSend,
          res.data.newMessage.id || res.data.newMessage._id,
          res.data.newMessage.createdAt,
        );
      }

      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    setChatToDelete(chatId);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      await axios.delete(`${API_URL}/api/chat/${chatToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => prev.filter((c) => (c.id || c._id) !== chatToDelete));
      if ((activeChat?.id || activeChat?._id) === chatToDelete) setActiveChat(null);
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
    setChatToDelete(null);
  };

  const handleDeleteMessage = async (chatId, messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/chat/${chatId}/message/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages(res.data.chat.messages);
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const getChatPartner = (chat) => {
    return (user.id || user._id) === (chat.buyer.id || chat.buyer._id) ? chat.seller : chat.buyer;
  };

  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );

  return (
    <div className={`${s.chatContainer} ${s.chatContainerSeller}`}>
      <div className={s.chatWrapper}>
        {/* Conversations Sidebar */}
        <div className={`${s.sidebar} ${activeChat ? s.sidebarHidden : ""}`}>
          <div className={s.sidebarHeader}>
            <h2 className={s.sidebarTitle}>Messages</h2>
          </div>
          <div className={s.sidebarContent}>
            {conversations.length === 0 ? (
              <div className={s.emptyConversations}>
                <HiOutlineChatAlt2 className={s.emptyIcon} />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat.id || chat._id}
                  className={`${s.conversationItem} ${(activeChat?.id || activeChat?._id) === (chat.id || chat._id) ? s.conversationItemActive : ""}`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className={s.avatar}>
                    {getChatPartner(chat)?.profilePic ? (
                      <img
                        className={s.avatarImg}
                        src={getChatPartner(chat).profilePic}
                        alt=""
                      />
                    ) : (
                      getChatPartner(chat)?.name?.charAt(0)
                    )}
                  </div>
                  <div className={s.conversationInfo}>
                    <div className={s.conversationName}>
                      {getChatPartner(chat)?.name}
                    </div>
                    <div className={s.conversationPreview}>
                      {chat.messages?.at(-1)?.text || "Started a conversation"}
                    </div>
                  </div>
                  <button
                    className={s.deleteChatButton}
                    onClick={(e) => handleDeleteChat(e, chat.id || chat._id)}
                    title="Delete Conversation"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={s.chatArea}>
          {activeChat ? (
            <>
              <div className={s.chatHeader}>
                <div className={s.chatHeaderLeft}>
                  <button
                    className={s.backButton}
                    onClick={() => setActiveChat(null)}
                  >
                    <HiChevronLeft size={24} />
                  </button>
                  <div className={s.avatar}>
                    {getChatPartner(activeChat)?.profilePic ? (
                      <img
                        className={s.avatarImg}
                        src={getChatPartner(activeChat).profilePic}
                        alt=""
                      />
                    ) : (
                      getChatPartner(activeChat)?.name?.charAt(0)
                    )}
                  </div>
                  <div className={s.chatPartnerName}>
                    {getChatPartner(activeChat)?.name}
                  </div>
                </div>
              </div>

              <div className={s.messagesArea}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`${s.messageBubble} ${(msg.senderId || msg.sender?.id || msg.sender?._id || msg.sender) === (user.id || user._id) ? s.messageOwn : s.messageOther}`}
                  >
                    <div className={s.messageContent}>
                      {msg.image && (
                        <div className={s.messageImageWrapper}>
                          <img
                            src={msg.image}
                            alt="Property Reference"
                            className={s.messageImage}
                          />
                        </div>
                      )}
                      <div className={s.messageText}>{msg.text}</div>
                      {(msg.senderId || msg.sender?.id || msg.sender?._id || msg.sender) === (user.id || user._id) && (
                        <button
                          className={s.deleteMessageButton}
                          onClick={() =>
                            handleDeleteMessage(activeChat.id || activeChat._id, msg.id || msg._id)
                          }
                          title="Delete Message"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      )}
                    </div>
                    <span className={s.messageTime}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className={s.messageForm} onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className={s.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className={s.sendButton}>
                  <HiPaperAirplane className={s.sendIcon} />
                </button>
              </form>
            </>
          ) : (
            <div className={s.noChatSelected}>
              <HiOutlineChatAlt2 className={s.noChatIcon} />
              <h3 className={s.noChatTitle}>Your Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {chatToDelete && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "1rem",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <h3 style={{
              margin: "0 0 1rem 0",
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "#0f172a"
            }}>Delete Conversation</h3>
            <p style={{
              margin: "0 0 1.5rem 0",
              color: "#64748b",
              fontSize: "0.95rem"
            }}>Are you sure you want to delete this conversation?</p>
            <div style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center"
            }}>
              <button 
                onClick={() => setChatToDelete(null)}
                style={{
                  padding: "0.6rem 1.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#fff",
                  color: "#334155",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteChat}
                style={{
                  padding: "0.6rem 1.5rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
