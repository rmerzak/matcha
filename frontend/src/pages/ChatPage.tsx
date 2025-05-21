import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { Chat } from "../components/Chat";
import { useContext, useEffect } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { useParams } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";
import { ChatBox } from "../components/ChatBox";
import { Container, Stack } from "react-bootstrap";

function ChatPage() {
  const { getMyMatches, matches } = useMatchStore();
  const { updateCurrentChat } = useContext(ChatContext);
  const { id } = useParams();

  useEffect(() => {
    updateCurrentChat(id);
    getMyMatches();
  }, [getMyMatches, id]);

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-red-100 via-purple-100 to-blue-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-grow flex-col h-screen">
        <Header />
        {/* <Chat /> */}
        <Container>
          <Stack direction="horizontal" gap={4} className="items-start" >
            <ChatBox />
          </Stack>
        </Container>
      </div>
    </div>
  );
}

export default ChatPage;
