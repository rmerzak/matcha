import { io, Socket } from "socket.io-client";
import { Message, SendMessagePayload } from "../types/socket";

// Define the type for your Socket.IO events
interface ServerToClientEvents {
  message: (data: { id: string; text: string }) => void;
  // Add other events your server emits
  new_message: (data: Message) => void;
}

interface ClientToServerEvents {
//   sendMessage: (data: { text: string }) => void;
  // Add other events your client emits
  send_message: (payload: SendMessagePayload) => void;

}

const authToken = localStorage.getItem("jwt");
  if (!authToken) {
    console.log("Please log in to view matches");
  }

// Create a typed Socket instance
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:8000",
  {
    extraHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
    auth: {
      token: authToken,
    },
    withCredentials: true,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }
);

export default socket;
