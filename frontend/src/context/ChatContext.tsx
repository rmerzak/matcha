import { createContext, useCallback, useEffect, useState } from "react";
import { getRequest, baseUrl, postRequest } from "../utils/services";
import { AuthUserType } from "../store/useAuthStore";
import { useParams } from "react-router-dom";

interface ChatContextType {
  updateCurrentChat: (chat: any) => void;
  messages: any;
  isMessagesLoading: boolean;
  messagesError: any;
  currentChatId: string | null;
}
export const ChatContext = createContext<ChatContextType>({
  updateCurrentChat: () => {},
  messages: null,
  isMessagesLoading: false,
  messagesError: null,	
  currentChatId: null,
});

interface ChatContextProviderProps {
  children: React.ReactNode;
  user: AuthUserType | null;
}

export const ChatContextProvider = ({
  children,
  user,
}: ChatContextProviderProps) => {
  const [currentChatId, setCurrentChatId] = useState(null as string | null);
  const [messages, setMessages] = useState(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  console.log("Messages: ", messages);
  useEffect(() => {
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

    getMessages();
  }, [currentChatId]);

  const updateCurrentChat = useCallback((chat: string) => {
    setCurrentChatId(chat);
  }, []);

  return (
    <ChatContext.Provider
      value={{ currentChatId, updateCurrentChat, messages, isMessagesLoading, messagesError }}
    >
      {children}
    </ChatContext.Provider>
  );
};
