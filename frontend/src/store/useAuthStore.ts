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
  signIn: (data: { username: string; password: string }) => Promise<void>;
  signOut: () => void;
  status: VerificationStatus;
  checkAuth: () => Promise<void>;
  userData: {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
  } | null;
  verifyEmail: (token: string | null) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (new_password: string, token: string | null) => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  checkingAuth: true,
  loading: false,
  status: "verifying",
  userData: null,

  resetPassword: async (new_password, token) => {
    try {
      if (!token) {
        set({ status: "error" });
        toast.error("Invalid verification link");
        return;
      }
      set({ loading: true });
      const response = await axiosInstance.post("/auth/resetPassword", null, {
        params: { new_password, token },
      });
      if (response.status === 200) {
        toast.success(
          "Password successfully updated. You can now log in with your new password.",
          {
            duration: 5000, // Duration in milliseconds (5 seconds)
          }
        );
        set({ status: "success" });
      }
    } catch (error: any) {
      set({ status: "error" });
      toast.error(error.response.data.detail || "Password reset failed");
    } finally {
      set({ loading: false });
    }
  },

  requestPasswordReset: async (email) => {
    try {
      set({ loading: true });
      await axiosInstance.post("/auth/requestPasswordReset", null, {
        params: { email },
      });
      toast.success(
        "Password reset email sent successfully! Check your inbox.",
        {
          duration: 6000, // Duration in milliseconds (6 seconds)
        }
      );
    } catch (error: any) {
      toast.error(error.response.data.detail || "Something went wrong");
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (data) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.post("/auth/login", data);
      const jwt = res.data.data.result.access_token;
      localStorage.setItem("jwt", jwt);
    } catch (error: any) {
      toast.error(error.response.data.detail || "Something went wrong");
    } finally {
      set({ loading: false });
    }
  },

  signOut: () => {
    localStorage.removeItem("jwt");
    set({ authUser: null });
  },

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
        toast.success("Email verified successfully! You can now log in.");
        const jwt = response.data.data.result.access_token;
        localStorage.setItem("jwt", jwt);
        set({ status: "success" });
        const config = {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        };
        try {
          const res = await axiosInstance.get("/auth/me", config);
          const email = res.data.data.result.email;
          set({ authUser: email });
        } catch (error) {
          console.error("/me error:", error);
        }
      }
    } catch (error: any) {
      set({ status: "error" });
      toast.error(error.response.data.detail || "Email verification failed");
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
      toast.success(
        "Registration successful! Please check your email to verify your account.",
        {
          duration: 6000, // Duration in milliseconds (6 seconds)
        }
      );
    } catch (error: any) {
      toast.error(error.response.data.detail || "Something went wrong");
    } finally {
      set({ loading: false });
    }
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      //   const config = {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   };
      const body = {
        token: token,
        utility: "ACCESS_TOKEN",
      };
      set({ checkingAuth: true });
      const res = await axiosInstance.post("/auth/verifyToken", body);
      const email = res.data.data.result.user_email;
      set({ authUser: email });
    } catch (error) {
      localStorage.removeItem("jwt");
      set({ authUser: null });
    } finally {
      set({ checkingAuth: false });
    }
  },
}));

export default useAuthStore;
