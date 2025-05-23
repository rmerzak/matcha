import { createContext, useCallback, useEffect, useState, ReactNode } from "react";
import { getRequest, baseUrl, postRequest } from "../utils/services";
import useAuthStore, { AuthUserType } from "../store/useAuthStore";
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

// Define proper types for the context
interface ChatContextType {
  updateCurrentChat: (chatId: string | null | undefined) => void;
  messages: MessageType[];
  isMessagesLoading: boolean;
  messagesError: string | null;
  currentChatId: string | null | undefined;
  sendTextMessage: (
    textMessage: string,
    senderId: string,
    currentChatId: string,
    setTextMessage: React.Dispatch<React.SetStateAction<string>>
  ) => Promise<void>;
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
  sendTextMessage: async () => {},
  sendMessage: () => {},
  socket: null,
  clearChat: () => {},
});

interface ChatContextProviderProps {
  children: ReactNode;
}

export const ChatContextProvider = ({ children }: ChatContextProviderProps) => {
  const { authUser } = useAuthStore();
  const [currentChatId, setCurrentChatId] = useState<string | null| undefined>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const authToken = localStorage.getItem("jwt");

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
      const response = await getRequest(`${baseUrl}/message/history/${currentChatId}`);
      
      if (response.error) {
        setMessagesError(response.message || "Failed to load messages");
        setIsMessagesLoading(false);
        return;
      }
      
      // Sort messages by date (newest last)
      const sortedMessages = response.data.messages.sort((a: MessageType, b: MessageType) => 
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
  const sendMessage = useCallback((
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
        setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
        return;
      }
    });
  }, [socket, authUser?.id]);

  // Send message via REST API (fallback)
  const sendTextMessage = useCallback(async (
    textMessage: string,
    senderId: string,
    currentChatId: string,
    setTextMessage: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!textMessage.trim()) return;

    try {
      const response = await postRequest(
        `${baseUrl}/message/send`,
        JSON.stringify({
          receiver_id: currentChatId,
          content: textMessage,
        })
      );

      if (response.error) {
        setMessagesError(response.message || "Failed to send message");
        return;
      }

      setMessages((prev) => [...prev, response.data]);
      setTextMessage("");
    } catch (error) {
      setMessagesError("An error occurred while sending message");
      console.error("Error sending message:", error);
    }
  }, []);

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

  return (
    <ChatContext.Provider
      value={{
        currentChatId,
        updateCurrentChat,
        messages,
        isMessagesLoading,
        messagesError,
        sendTextMessage,
        socket,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
