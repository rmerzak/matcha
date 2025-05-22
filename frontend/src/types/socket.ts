// types/socket.ts
export interface Message {
	id: string;
	sender: string;
	receiver: string | null;
	content: string;
	is_read: boolean;
	sent_at: string; // ISO timestamp (e.g., "2025-05-08T12:00:00.000Z")
  }
  
  export interface SendMessagePayload {
	receiver_id: string | null;
	content: string;
  }
  
  export interface ErrorPayload {
	message: string;
  }