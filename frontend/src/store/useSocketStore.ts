// src/store/socketStore.ts
import { create } from "zustand";
import socket from "../utils/socket";
import { Message, SendMessagePayload } from "../types/socket";

// interface Message {
//   id: string;
//   text: string;
// }

interface SocketState {
  isConnected: boolean;
  messages: Message[];
  socket: typeof socket;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (payload: SendMessagePayload) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  messages: [],
  socket,

  // Connect to Socket.IO server
  connect: () => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to socket.io server");
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket.io server");
      set({ isConnected: false });
    });

    // Handle incoming messages
    socket.on("new_message", (data: Message) => {
      console.log("New message received:", data);
      set((state) => ({
        messages: [...state.messages, data],
      }));
    });
  },

  // Disconnect from server
  disconnect: () => {
    socket.disconnect();
    set({ isConnected: false });
  },

  // Send a message
  sendMessage: (payload: SendMessagePayload) => {
    console.log("Sending message:", payload);
    socket.emit("send_message", payload);
  },
}));
