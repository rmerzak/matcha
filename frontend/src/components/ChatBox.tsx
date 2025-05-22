import useAuthStore from "../store/useAuthStore";
import { ChatContext } from "../context/ChatContext";
import { useUserStore } from "../store/useUserStore";
import { useContext, useEffect, useState } from "react";
import { Stack } from "react-bootstrap";
import moment from "moment";
import InputEmoji from "react-input-emoji";

export const ChatBox = () => {
  const { authUser } = useAuthStore();
  const { currentChatId, messages, isMessagesLoading, sendMessage } =
    useContext(ChatContext);
  const { user, getUser } = useUserStore();
  const [textMessage, setTextMessage] = useState("");

  useEffect(() => {
    if (currentChatId) {
      getUser(currentChatId);
    }
  }, [currentChatId, getUser, messages]);

  if (isMessagesLoading) {
    return <p className="flex items-center justify-center">Loading Chat...</p>;
  }

  console.log("Messages: ", messages);

  return (
    <Stack gap={4} className="chat-box h-full bg-red-300 border rounded-lg">
      <div className="chat-header border rounded-lg p-4 bg-gray-200 gap-2">
        <h2 className="text-lg font-semibold">Chat with</h2>
        <strong>@{user && user.username}</strong>
      </div>
      <Stack
        gap={3}
        className="messages flex flex-col-reverse h-full overflow-y-auto"
      >
        {messages &&
          messages.map((message: any, index: any) => (
            <Stack
              key={index}
              className={`${
                message.sender === authUser?.id
                  ? "message self self-end flex-grow-0 flex-col flex"
                  : "message self-start flex-grow-0 flex flex-col"
              }`}
            >
              <span>{message.content}</span>
              <span className="message-footer">
                {moment(message.sent_at).calendar()}
              </span>
            </Stack>
          ))}
      </Stack>
      <Stack
        direction="horizontal"
        gap={3}
        className="chat-input flex flex-grow-0 items-center p-4 bg-gray-200 rounded-lg"
      >
        <InputEmoji
          value={textMessage}
          onChange={setTextMessage}
          background="#e5e7eb"
          shouldReturn={false}
          shouldConvertEmojiToImage={false}
          placeholder="Message..."
          placeholderColor="#9ca3af"
        />
        <button
          onClick={() =>
            sendMessage(
              {
                receiver_id: currentChatId,
                content: textMessage,
              },
              setTextMessage
            )
          }
          className="send-btn flex-grow-0 flex items-center justify-center bg-blue-500 text-white rounded-lg p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-send-fill"
            viewBox="0 0 16 16"
          >
            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
          </svg>
        </button>
      </Stack>
    </Stack>
  );

  //   return <main>
  // 	<div className="flex flex-col h-full">
  // 	  <div className="flex items-center justify-between p-4 bg-gray-200">
  // 		<h2 className="text-lg font-semibold">Chat with {user?.username}</h2>
  // 	  </div>
  // 	  <div className="flex-grow overflow-y-auto p-4">
  // 		{messages?.map((message: any) => (
  // 		  <div
  // 			key={message.id}
  // 			className={`p-2 my-2 rounded-lg ${
  // 			  message.sender === authUser?.id
  // 				? "bg-blue-500 text-white self-end"
  // 				: "bg-gray-300 text-black self-start"
  // 			}`}
  // 		  >
  // 			{message.content}
  // 		  </div>
  // 		))}
  // 	  </div>
  // 	</div>
  //   </main>;
};
