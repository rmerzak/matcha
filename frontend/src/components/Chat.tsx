// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";
// import { Message, SendMessagePayload, ErrorPayload } from "../types/socket";

// interface ChatProps {
//   authToken: string;
//   userId: string;
// }

// const Chat: React.FC<ChatProps> = ({ authToken, userId }) => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState<string>("");
//   const [receiverId, setReceiverId] = useState<string>("");
//   const [socket, setSocket] = useState<any | null>(null);

//   useEffect(() => {
//     const newSocket = io("http://localhost:8000", {
//       extraHeaders: {
//         Authorization: `Bearer ${authToken}`,
//       },
//       auth: {
//         token: authToken,
//       },
//       withCredentials: true,
//       transports: ["websocket"],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//     // Handle connection
//     newSocket.on("welcome", () => {
//       console.log("Connected to socket.io server");
//     });

//     // Handle incoming messages
//     newSocket.on("new_message", (message: Message) => {
//       setMessages((prev) => [...prev, message]);
//     });

//     // Handle errors
//     newSocket.on("error", (data: ErrorPayload) => {
//       console.error("Socket.io error:", data.message);
//       // Optionally show error to user (e.g., toast notification)
//     });

//     // Handle connection errors
//     // newSocket.on("connect_error", (error: Error) => {
//     //   console.error("Connection error:", error.message);
//     // });

//     // Handle disconnection
//     newSocket.on("disconnect", () => {
//       console.log("Disconnected from socket.io server");
//     });

//     setSocket(newSocket);

//     // Cleanup on unmount
//     return () => {
//       newSocket.disconnect();
//     };
//   }, [authToken]);

//   const sendMessage = () => {
//     if (socket && input && receiverId) {
//       const payload: SendMessagePayload = {
//         receiver_id: receiverId,
//         content: input,
//       };
//       socket.emit("send_message", payload);
//       setInput("");
//     }
//   };

//   return (
//     <div>
//       <h2>Chat</h2>
//       <div>
//         <label>
//           Receiver ID:
//           <input
//             type="text"
//             value={receiverId}
//             onChange={(e) => setReceiverId(e.target.value)}
//             placeholder="Enter receiver ID"
//           />
//         </label>
//       </div>
//       <div
//         style={{
//           height: "300px",
//           overflowY: "scroll",
//           border: "1px solid #ccc",
//           padding: "10px",
//         }}
//       >
//         {messages.map((msg) => (
//           <p key={msg.id}>
//             <strong>{msg.sender === userId ? "You" : msg.sender}:</strong>{" "}
//             {msg.content}{" "}
//             <small>({new Date(msg.sent_at).toLocaleTimeString()})</small>
//           </p>
//         ))}
//       </div>
//       <input
//         type="text"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         placeholder="Type a message..."
//         style={{ width: "80%", margin: "10px 0" }}
//       />
//       <button onClick={sendMessage} disabled={!input || !receiverId}>
//         Send
//       </button>
//     </div>
//   );
// };

// export default Chat;

// src/components/Chat.tsx
import { FormEvent, useState } from "react";
import { useSocketStore } from "../store/useSocketStore";
import { useParams } from "react-router-dom";

export const Chat = () => {
  const { isConnected, messages, sendMessage } = useSocketStore();
  const [input, setInput] = useState("");
  const { id } = useParams();
  if (!id) {
    console.error("Receiver ID is required");
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ content: input, receiver_id: id });
      setInput("");
    }
  };

  return (
    <div>
      <h2>Chat {isConnected ? "(Connected)" : "(Disconnected)"}</h2>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>{msg.content}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!isConnected}
        />
        <button type="submit" disabled={!isConnected}>
          Send
        </button>
      </form>
    </div>
  );
};
