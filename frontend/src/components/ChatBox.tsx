import useAuthStore from "../store/useAuthStore";
import { ChatContext } from "../context/ChatContext";
import { useUserStore } from "../store/useUserStore";
import { useContext, useEffect } from "react";
import { Stack } from "react-bootstrap";
import moment from "moment";

export const ChatBox = () => {
  const { authUser } = useAuthStore();
  const { currentChatId, messages, isMessagesLoading } =
    useContext(ChatContext);
  const { user, getUser } = useUserStore();

  useEffect(() => {
    if (currentChatId) {
      getUser(currentChatId);
    }
  }, [currentChatId, getUser]);

  if (isMessagesLoading) {
    return <p className="flex items-center justify-center">Loading Chat...</p>;
  }

  return (
    <Stack gap={4} className="chat-box h-full bg-red-300 border rounded-lg">
      <div className="chat-header border rounded-lg p-4 bg-gray-200 gap-2">
		<h2 className="text-lg font-semibold">Chat with</h2>
        <strong>@{user && user.username}</strong>
      </div>
      <Stack gap={3} className="messages flex flex-col-reverse h-full overflow-y-auto">
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
