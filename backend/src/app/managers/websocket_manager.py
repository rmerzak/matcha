
from fastapi import WebSocket


class WebSocketsManager:
    def __init__(self):
        self.handlers = dict = {}
        self.chats = dict = {}
        self.user_uid_to_websocket = dict = {}
    
    def handle(self, event):
        def decorator(func):
            self.handlers[event] = func
            return func
        return decorator
    
    async def connect_socket(self, websocket: WebSocket):
        await websocket.accept()

    async def add_user_socket_connetion(self, user_uid:str, websocket: WebSocket):
        self.user_uid_to_websocket.setdefault(user_uid, set()).add(websocket)
    
    async def add_user_to_chat(self, chat_id: str, websocket: WebSocket):
        if chat_id in self.chats:
            self.chats[chat_id].add(websocket)
        else:
            self.chats[chat_id] = {websocket}
    
    async def remove_user_from_chat(self, chat_id: str, websocket: WebSocket):
        if chat_id in self.chats:
            self.chats[chat_id].remove(websocket)
    
    async def disconnect_socket(self, user_uid: str, websocket: WebSocket):
        if user_uid in self.user_uid_to_websocket:
            self.user_uid_to_websocket[user_uid].remove(websocket)
    
    async def send_error(self, message: str, websocket: WebSocket):
        await websocket.send_json({"message": message, status: "error"})
