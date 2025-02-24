import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

type VerificationStatus = "verifying" | "success" | "error";

type AuthUserType = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string | undefined;
  sexualPreferences?: string | undefined;
  bio?: string | undefined;
  interests?: string[] | undefined;
  pictures?: string[] | undefined;
};

type SignUpDataType = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};

type AuthState = {
  authUser: AuthUserType | null;
  checkingAuth: boolean;
  loading: boolean;
  status: VerificationStatus;
  signUp: (data: SignUpDataType) => Promise<void>;
  signIn: (data: { username: string; password: string }) => Promise<void>;
  signOut: () => void;
  checkAuth: () => Promise<void>;
  verifyEmail: (token: string | null) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (new_password: string, token: string | null) => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  checkingAuth: true,
  loading: false,
  status: "verifying",

  signUp: async (data) => {
    try {
      set({ loading: true });
      await axiosInstance.post("/auth/register", data);
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
      }
    } catch (error: any) {
      set({ status: "error" });
      toast.error(error.response.data.detail || "Email verification failed");
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

  checkAuth: async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const body = {
        token: token,
        utility: "ACCESS_TOKEN",
      };
      set({ checkingAuth: true });
      await axiosInstance.post("/auth/verifyToken", body);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.get("/auth/me", config);
      const { email, first_name, last_name, username, gender, bio, sexual_preferences, interests, pictures } = response.data;
      const labledInterests = interests.map((interest: string) => ({
        value: interest,
        label: `#${interest}`,
      }));
      set({
        authUser: {
          username,
          email,
          firstName: first_name,
          lastName: last_name,
          gender,
          sexualPreferences: sexual_preferences,
          bio,
          interests: labledInterests,
          pictures
        },
      });
    } catch (error) {
      localStorage.removeItem("jwt");
      set({ authUser: null });
    } finally {
      set({ checkingAuth: false });
    }
  },
}));

export default useAuthStore;
