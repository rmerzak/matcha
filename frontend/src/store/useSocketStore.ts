// src/store/socketStore.ts
import { create } from "zustand";
import { Message, SendMessagePayload } from "../types/socket";
import { io, Socket } from "socket.io-client";

// interface Message {
//   id: string;
//   text: string;
// }

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

interface SocketState {
  isConnected: boolean;
  messages: Message[];
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connect: (authToken: string | undefined | null) => void;
  disconnect: () => void;
  sendMessage: (payload: SendMessagePayload) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  isConnected: false,
  messages: [],
  socket: null,

  // Connect to Socket.IO server
  connect: (authToken: string | undefined | null) => {
    console.log("Connecting to socket.io server with token:", authToken);
    if (authToken) {
      set({
        socket: io("http://localhost:8000", {
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
        }),
      });
      get().socket?.connect();
    }

    get().socket?.on("connect", () => {
      console.log("Connected to socket.io server");
      set({ isConnected: true });
    });

    get().socket?.on("disconnect", () => {
      console.log("Disconnected from socket.io server");
      set({ isConnected: false });
    });

    // Handle incoming messages
    get().socket?.on("new_message", (data: Message) => {
      console.log("New message received:", data);
      set((state) => ({
        messages: [...state.messages, data],
      }));
    });
  },

  // Disconnect from server
  disconnect: () => {
    get().socket?.disconnect();
    set({ isConnected: false });
  },

  // Send a message
  sendMessage: (payload: SendMessagePayload) => {
    console.log("Sending message:", payload);
    get().socket?.emit("send_message", payload);
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: "test",
          sender: "test",
          receiver: payload.receiver_id,
          content: payload.content,
          is_read: false,
          sent_at: new Date().toISOString(),
        },
      ], // Add the new message to the state
    }));
  },
}));
