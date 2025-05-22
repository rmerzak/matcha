import { createContext, useCallback, useEffect, useState } from "react";
import { getRequest, baseUrl, postRequest } from "../utils/services";
import useAuthStore, { AuthUserType } from "../store/useAuthStore";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { SendMessagePayload } from "../types/socket";

interface MessageType {
  id: string | null;
  sender: string | null | undefined;
  receiver: string | null;
  content: string;
  is_read: boolean;
  sent_at: string | null;
}

interface ChatContextType {
  updateCurrentChat: (chat: any) => void;
  messages: any;
  isMessagesLoading: boolean;
  messagesError: any;
  currentChatId: string | null;
  sendTextMessage: (
    textMessage: string,
    senderId: string | undefined,
    currentChatId: string | null,
    setTextMessage: any
  ) => void;
  sendMessage: (payload: SendMessagePayload, setTextMessage: any) => void;
  socket: any;
}

export const ChatContext = createContext<ChatContextType>({
  updateCurrentChat: () => {},
  messages: null,
  isMessagesLoading: false,
  messagesError: null,
  currentChatId: null,
  sendTextMessage: () => {},
  sendMessage: () => {},
  socket: null,
});

interface ChatContextProviderProps {
  children: React.ReactNode;
  user: AuthUserType | null;
}

export const ChatContextProvider = ({
  children,
  user,
}: ChatContextProviderProps) => {
  const { authUser } = useAuthStore();
  const [currentChatId, setCurrentChatId] = useState(null as string | null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<any>(null);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState({});
  const [socket, setSocket] = useState<any>(null);
  const authToken = localStorage.getItem("jwt");

  // console.log(messages);

  useEffect(() => {
    console.log(authToken);
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

    return () => {
      newSocket.disconnect();
    };
  }, [authToken]);


  // send message
  useEffect(() => {
    if (socket === null) return;
    socket.emit("send_message", (data: any) => {
      console.log("New message received:", data);
      setMessages((prev) => [...prev, data]);
    });
    return () => {
      socket.off("send_message");
    };
  }, [newMessage]);

  const getMessages = async () => {
    if (currentChatId === null) return;
    setIsMessagesLoading(true);
    setMessagesError(null);

    const response = await getRequest(
      `${baseUrl}/message/history/${currentChatId}`
    );
    setIsMessagesLoading(false);

    if (response.error) {
      return setMessagesError(response);
    }
    setMessages(response.data.messages);
  };
  useEffect(() => {
    getMessages();
  }, [currentChatId, socket]);


  const sendMessage = (payload: SendMessagePayload, setTextMessage: any) => {
    if (socket) {
      socket.emit("send_message", payload);
      setNewMessage({
        sender: authUser?.id,
        id: "c26df1ef-7656-40ec-9d8d-7f5dc82cc419",
        receiver: payload.receiver_id,
        content: payload.content,
        is_read: false,
        sent_at: "2025-05-21T13:33:03.855551",
      });
      setMessages((prev) => [
        ...prev,
        {
          sender: authUser?.id,
          id: "c26df1ef-7656-40ec-9d8d-7f5dc82cc419",
          receiver: payload.receiver_id,
          content: payload.content,
          is_read: false,
          sent_at: "2025-05-21T13:33:03.855551",
        },
      ]);
      setTextMessage("");
      // await wait(3000); // Wait for 3 seconds
      // getMessages();
      // setNewMessage(payload)
    }
  };

  const sendTextMessage = useCallback(
    async (
      textMessage: string,
      senderId: string | undefined,
      currentChatId: string | null,
      setTextMessage: any
    ) => {
      if (!textMessage) return;

      const response = await postRequest(
        `${baseUrl}/message/send`,
        JSON.stringify({
          chatId: currentChatId,
          senderId,
          text: textMessage,
        })
      );

      if (response.error) {
        return setSendTextMessageError(response);
      }

      setNewMessage(response.data.message);
      setMessages((prev) => [...prev, response.data.message]);
      setTextMessage("");
    },

    []
  );

  const updateCurrentChat = useCallback((chat: string) => {
    setCurrentChatId(chat);
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
