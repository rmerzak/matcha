import { useParams } from "react-router-dom";
import Chat from "../components/Chat";
import { useEffect } from "react";
import useAuthStore from "../store/useAuthStore";

const ChatPage = () => {
  const { id } = useParams();
  const {authUser} = useAuthStore();
  const userId = authUser?.id;
  const token = localStorage.getItem("jwt");
  if (!token || !userId) {
    console.log("Please log in to view matches");
    return;
  }
  console.log(userId, token);

  return (
    <div>
      <h1>ChatPage</h1>
      <Chat userId={userId} authToken={token}  />
    </div>
  );
};

export default ChatPage;
