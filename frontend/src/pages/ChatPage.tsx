import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { useContext, useEffect } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { useParams } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";
import { ChatBox } from "../components/ChatBox";

function ChatPage() {
  const { getMyMatches } = useMatchStore();
  const { updateCurrentChat } = useContext(ChatContext);
  const { id } = useParams();

  useEffect(() => {
    updateCurrentChat(id);
    getMyMatches();
  }, [getMyMatches, id]);

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-red-100 via-purple-100 to-blue-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-grow flex-col h-screen ">
        <Header />
        <ChatBox />
      </div>
    </div>
  );
}

export default ChatPage;
