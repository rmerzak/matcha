import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";
import EmailVerification from "./pages/EmailVerification";

function App() {
  const { authUser } = useAuthStore();

  console.log(authUser)

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   if (checkingAuth) return null

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to={"/auth"} />}
        />
        <Route
          path="/auth"
          element={!authUser ? <AuthPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to={"/auth"} />}
        />
        <Route
          path="/chat/:id"
          element={authUser ? <ChatPage /> : <Navigate to={"/auth"} />}
        />
		<Route path="/verifyEmail" element={<EmailVerification />} />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
