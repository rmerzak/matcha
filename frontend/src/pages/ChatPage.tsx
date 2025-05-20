import { Chat } from "../components/Chat";
import useAuthStore from "../store/useAuthStore";

const ChatPage = () => {
  const {authUser} = useAuthStore();
  const userId = authUser?.id;
  const token = localStorage.getItem("jwt");
  if (!token || !userId) {
    console.log("Please log in to view matches");
    return;
  }

  return (
    <div>
      <h1>ChatPage</h1>
      {/* <Chat userId={userId} authToken={token}  /> */}
      <Chat />
    </div>
  );
};

export default ChatPage;
