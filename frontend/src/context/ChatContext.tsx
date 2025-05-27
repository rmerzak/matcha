import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getRequest, baseUrl, putRequest } from "../utils/services";
import useAuthStore from "../store/useAuthStore";
import { io, Socket } from "socket.io-client";
import { SendMessagePayload } from "../types/socket";

// Define proper types for messages
export interface MessageType {
  id: string;
  sender: string;
  receiver: string | null;
  content: string;
  is_read: boolean;
  sent_at: string;
}

type dataType = {
  id: string;
  type: string; // You could narrow it to specific values like 'like_received' if needed
  content: string;
  created_at: string; // Could also be Date if you parse it
  sender: {
    id: string;
    username: string;
    profile_picture: string;
  };
};

// Define proper types for notifications
export interface NotificationType {
  id: string;
  user_id: string;
  sender_id: string;
  content: string;
  username: string;
  profile_picture: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// Define proper types for the context
interface ChatContextType {
  updateCurrentChat: (chatId: string | null | undefined) => void;
  messages: MessageType[];
  isMessagesLoading: boolean;
  messagesError: string | null;
  currentChatId: string | null | undefined;
  notifications: NotificationType[];
  isNotificationsLoading: boolean;
  notificationsError: string | null;
  getNotifications: () => void;
  readNotifications: () => void;

  sendMessage: (
    payload: SendMessagePayload,
    setTextMessage: React.Dispatch<React.SetStateAction<string>>
  ) => void;
  socket: Socket | null;
  clearChat: () => void;
}

export const ChatContext = createContext<ChatContextType>({
  updateCurrentChat: () => {},
  messages: [],
  isMessagesLoading: false,
  messagesError: null,
  currentChatId: null,
  sendMessage: () => {},
  socket: null,
  clearChat: () => {},
  notifications: [],
  notificationsError: null,
  isNotificationsLoading: false,
  getNotifications: () => {},
  readNotifications: () => {},
});

interface ChatContextProviderProps {
  children: ReactNode;
}

export const ChatContextProvider = ({ children }: ChatContextProviderProps) => {
  const authToken = localStorage.getItem("jwt");
  const { authUser } = useAuthStore();
  const [currentChatId, setCurrentChatId] = useState<string | null | undefined>(
    null
  );
  const [socket, setSocket] = useState<Socket | null>(null);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null
  );

  // Initialize socket connection
  useEffect(() => {
    if (!authToken) return;

    const newSocket = io("http://localhost:8000", {
      extraHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
      auth: {
        token: authToken,
      },
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Socket event listeners
    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    newSocket.on("new_message", (data) => {
      console.log("New message received:", data);
      if (data.sender !== authUser?.id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    newSocket.on("view", (data) => {
      console.log("Someone viewed your profile", data);
      // if (data.sender !== authUser?.id) {
      //   setMessages((prev) => [...prev, data]);
      // }
    });

    newSocket.on("new_like", (obj) => {
      const data: dataType = obj.data;
      console.log("Someone liked your profile", data);
      setNotifications((prev) => [
        ...prev,
        {
          id: data.id,
          content: data.content,
          created_at: data.created_at,
          is_read: false,
          profile_picture: data.sender.profile_picture,
          sender_id: data.sender.id,
          type: data.type,
          user_id: data.sender.id,
          username: data.sender.username,
        },
      ]);

      // if (data.sender !== authUser?.id) {
      //   setMessages((prev) => [...prev, data]);
      // }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [authToken, authUser?.id]);

  // Fetch messages when current chat changes
  useEffect(() => {
    if (currentChatId) {
      getMessages();
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Get chat history
  const getMessages = async () => {
    if (!currentChatId) return;

    setIsMessagesLoading(true);
    setMessagesError(null);

    try {
      const response = await getRequest(
        `${baseUrl}/message/history/${currentChatId}`
      );

      if (response.error) {
        setMessagesError(response.message || "Failed to load messages");
        setIsMessagesLoading(false);
        return;
      }

      // Sort messages by date (newest last)
      const sortedMessages = response.data.messages.sort(
        (a: MessageType, b: MessageType) =>
          new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
      );

      setMessages(sortedMessages);
    } catch (error) {
      setMessagesError("An error occurred while fetching messages");
      console.error("Error fetching messages:", error);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  // Send message via socket
  const sendMessage = useCallback(
    (
      payload: SendMessagePayload,
      setTextMessage: React.Dispatch<React.SetStateAction<string>>
    ) => {
      if (!socket || !authUser?.id || !payload.content.trim()) return;

      // Optimistically add message to UI
      const tempMessage: MessageType = {
        id: `temp-${Date.now()}`,
        sender: authUser.id,
        receiver: payload.receiver_id,
        content: payload.content,
        is_read: false,
        sent_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      setTextMessage("");

      // Send via socket
      socket.emit("send_message", payload, (response: any) => {
        if (response?.error) {
          console.error("Error sending message:", response.error);
          // Remove the temp message if there was an error
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== tempMessage.id)
          );
          return;
        }
      });
    },
    [socket, authUser?.id]
  );

  // Update current chat
  const updateCurrentChat = useCallback((chatId: string | null | undefined) => {
    setCurrentChatId(chatId);
    setMessagesError(null);
  }, []);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
    setMessagesError(null);
  }, []);

  // Get notifications history
  const getNotifications = async () => {
    setIsNotificationsLoading(true);
    setNotificationsError(null);

    try {
      const response = await getRequest(
        `${baseUrl}/notification/get-notifications`
      );

      if (response.error) {
        setNotificationsError(response.message || "Failed to load messages");
        setIsNotificationsLoading(false);
        return;
      }

      // Sort notifications by date (newest last)
      const sortedNotifications = response.data.sort(
        (a: NotificationType, b: NotificationType) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setNotifications(sortedNotifications);
      console.log("sorted", sortedNotifications);
    } catch (error) {
      setNotificationsError("An error occurred while fetching notifications");
      console.error("Error fetching notifications:", error);
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  // Get notifications history
  const readNotifications = async () => {
    try {
      const response = await putRequest(`${baseUrl}/notification/mark-as-read`);
      if (response.error) {
        console.log(response.error);
        return;
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        currentChatId,
        updateCurrentChat,
        messages,
        isMessagesLoading,
        messagesError,
        socket,
        sendMessage,
        clearChat,
        notifications,
        isNotificationsLoading,
        notificationsError,
        getNotifications,
        readNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
