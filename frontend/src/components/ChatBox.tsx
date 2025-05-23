import { useContext, useEffect, useState, useRef } from "react";
import { Stack } from "react-bootstrap";
import moment from "moment";
import InputEmoji from "react-input-emoji";
import useAuthStore from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { ChatContext, MessageType } from "../context/ChatContext";
import { SignalZero } from "lucide-react";

export const ChatBox = () => {
  const { authUser } = useAuthStore();
  const {
    currentChatId,
    messages,
    isMessagesLoading,
    messagesError,
    sendMessage,
  } = useContext(ChatContext);
  const { user, getUser } = useUserStore();
  const [textMessage, setTextMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  // Fetch user data when chat changes
  useEffect(() => {
    if (currentChatId) {
      getUser(currentChatId);
    }
  }, [currentChatId, getUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message sending
  const handleSendMessage = () => {
    if (!textMessage.trim() || !currentChatId || !authUser?.id || isSending)
      return;

    setIsSending(true);

    try {
      sendMessage(
        {
          receiver_id: currentChatId,
          content: textMessage,
        },
        setTextMessage
      );
    } finally {
      setIsSending(false);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (messagesError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">
          <p>Error loading messages</p>
          <p className="text-sm">{messagesError}</p>
        </div>
      </div>
    );
  }

  if (!currentChatId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <Stack gap={4} className="chat-box h-full border rounded-lg flex flex-col lg:mx-auto lg:w-3xl lg:max-w-3xl">
      {/* Chat Header */}
      <div className="chat-header border-b p-4 bg-gray-100 flex items-center gap-3">
        {user?.profile_picture && (
          <img
            src={user.profile_picture}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <h2 className="text-lg font-semibold">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-sm text-gray-600">@{user?.username}</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages flex-grow overflow-y-auto p-4 ">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message: MessageType) => (
            <div
              key={message.id}
              className={`mb-4 max-w-[80%] ${
                message.sender === authUser?.id
                  ? "ml-auto self-end "
                  : "mr-auto"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-xl ${
                  message.sender === authUser?.id
                    ? "bg-blue-500 text-white rounded-br-none self-end ml-auto"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="break-words">{message.content}</p>
              </div>
              <div
                className={`text-xs mt-1 ${
                  message.sender === authUser?.id
                    ? "text-right text-gray-500"
                    : "text-left text-gray-500"
                }`}
              >
                {moment(message.sent_at).calendar()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input p-4 border-t  ">
        <div className="flex items-center gap-2  ">
          <div className="overflow-hidden w-full ">
            <InputEmoji
              value={textMessage}
              onChange={setTextMessage}
              onKeyDown={handleKeyPress as any}
              cleanOnEnter
              placeholder="Type a message..."
              borderRadius={8}
              borderColor="#e2e8f0"
              shouldReturn={true}
              shouldConvertEmojiToImage={false}

            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!textMessage.trim() || isSending}
            className={`p-3 rounded-full ${
              !textMessage.trim() || isSending
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } transition-colors`}
          >
            {isSending ? (
              <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </Stack>
  );
};
