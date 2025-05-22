import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";
import EmailVerification from "./pages/EmailVerification";
import { useEffect } from "react";
import ResetPassword from "./pages/ResetPassword";
import FillProfilePage from "./pages/FillProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";
import ProfileViewsPage from "./pages/analytics/ProfileViewsPage";
import ProfileLikesPage from "./pages/analytics/ProfileLikesPage";
import SearchPage from "./pages/SearchPage";
import BlockedProfilesPage from "./pages/BlockedProfilesPage";
import { ChatContextProvider } from "./context/ChatContext";
import { SocketProvider } from "./context/SocketProvider.tsx";

function App() {
  const { authUser, checkAuth, checkingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) return null;
  if (authUser && !authUser.gender) {
    return (
      <div>
        <Navigate to={"/fill-profile"} replace={true} />
        <FillProfilePage />
      </div>
    );
  }

  return (
    <SocketProvider>

    <ChatContextProvider user={authUser}>
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <Routes>
          <Route
            path="/"
            element={
              authUser ? <HomePage /> : <Navigate replace={true} to="/auth" />
            }
          />
          <Route
            path="/profile"
            element={
              authUser ? (
                <ProfilePage />
              ) : (
                <Navigate replace={true} to="/auth" />
              )
            }
          />
          <Route
            path="/analytics/profile-views"
            element={
              authUser ? (
                <ProfileViewsPage />
              ) : (
                <Navigate replace={true} to={"/auth"} />
              )
            }
            />
          <Route
            path="/analytics/profile-likes"
            element={
              authUser ? (
                <ProfileLikesPage />
              ) : (
                <Navigate replace={true} to={"/auth"} />
              )
            }
          />
          <Route
            path="/blocked-profiles"
            element={
              authUser ? (
                <BlockedProfilesPage />
              ) : (
                <Navigate replace={true} to={"/auth"} />
              )
            }
            />
          <Route
            path="/auth"
            element={
              !authUser ? <AuthPage /> : <Navigate replace={true} to={"/"} />
            }
            />
          <Route
            path="/"
            element={
              authUser ? <HomePage /> : <Navigate replace={true} to="/auth" />
            }
            />
          <Route
            path="/fill-profile"
            element={
              authUser ? (
                <FillProfilePage />
              ) : (
                <Navigate replace={true} to={"/auth"} />
              )
            }
            />
          <Route
            path="/edit-profile/"
            element={
              authUser ? (
                <EditProfilePage />
              ) : (
                <Navigate replace={true} to={"/auth"} />
              )
            }
            />
          <Route
            path="/chat/:id"
            element={
              authUser ? <ChatPage /> : <Navigate replace={true} to={"/auth"} />
            }
            />
          <Route path="/verifyEmail" element={<EmailVerification />} />
          <Route
            path="/resetPassword"
            element={
              !authUser ? (
                <ResetPassword />
              ) : (
                <Navigate replace={true} to={"/"} />
              )
            }
          />
          <Route
            path="/search"
            element={
              authUser ? (
                <SearchPage />
              ) : (
                <Navigate replace={true} to={"/auth"} />
              )
            }
            />
          <Route
            path="/users/:username"
            element={
              authUser ? (
                <UsersPage />
              ) : (
                <Navigate replace={true} to={"/auth"} />
              )
            }
            />
        </Routes>

        <Toaster />
      </div>
    </ChatContextProvider>
            </SocketProvider>
  );
}

export default App;
