import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

type VerificationStatus = "verifying" | "success" | "error";

type AuthState = {
  authUser: string | null;
  checkingAuth: boolean;
  loading: boolean;
  signup: (data: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  status: VerificationStatus;
  verifyEmail: (token: string | null) => Promise<void>;
  checkAuth: () => Promise<void>;
  userData: {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
  } | null;
};

const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  checkingAuth: true,
  loading: false,
  status: "verifying",
  userData: null,

  verifyEmail: async (token) => {
    try {
      if (!token) {
        set({ status: "error" });
        toast.error("Invalid verification link");
        return;
      }
      const response = await axiosInstance.get("/auth/verifyEmail", {
        params: { token },
      });
      if (response.status === 200) {
        set({ status: "success" });
        toast.success("Email verified successfully! You can now log in.");
        const jwt = response.data.data.result.access_token;
        console.log(jwt);
		const userData = get().userData;
        console.log("userData:", userData);
        localStorage.setItem("jwt", jwt);
      }
    } catch (error: any) {
      // console.error("Verification error:", error);
      set({ status: "error" });
      toast.error(error.response.data.message || "Email verification failed");
    }
  },

  signup: async (data) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.post("/auth/register", data);
	  const { email, first_name, last_name, username } = res.data.data.result;
	  set({
		userData: {
		  email,
		  first_name,
		  last_name,
		  username,
		},
	  });
	  set({authUser: username})
      toast.success(
        "Registration successful! Please check your email to verify your account.",
        {
          duration: 6000, // Duration in milliseconds (6 seconds)
        }
      );
    } catch (error: any) {
      toast.error(error.response.data.message || "Something went wrong");
    } finally {
      set({ loading: false });
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.post("/auth/verifyToken");
      console.log(res.data);
      set({ authUser: res.data.user });
    } catch (error) {
      set({ authUser: null });
      console.log(error);
    } finally {
      set({ checkingAuth: false });
    }
  },
}));

export default useAuthStore;
