import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import useAuthStore from "./useAuthStore";

type UserStoreType = {
  user: any;
  loading: boolean;
  updateProfile: (data: DataType) => Promise<void>;
  updateLocation: (location: Location) => Promise<void>;
  getUser: (id: string) => Promise<void>;

};

type DataType = {
  first_name?: string;
  last_name?: string;
  email?: string;
  gender: string;
  interests: string[];
  sexual_preferences: string;
  bio: string;
  profile_picture: string | ArrayBuffer | null | "";
  additional_pictures: string[];
  date_of_birth: Date;
  latitude?: string;
  longitude?: string;
};

type Location = {
  location?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
};

export const useUserStore = create<UserStoreType>((set) => ({
  user: null,
  loading: false,

  getUser: async (id: string) => {
    const token = localStorage.getItem("jwt");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await axiosInstance.get(`/users/id/${id}`, config);
      set({user: res.data.data})
    } catch (error: any) {
      console.log("Something went wrong");
    } 
  },

  updateProfile: async (data: DataType) => {
    const { checkAuth } = useAuthStore.getState();
    const token = localStorage.getItem("jwt");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      set({ loading: true });
      await axiosInstance.put("/users/update-profile", data, config);
      await checkAuth();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Something went wrong");
    } finally {
      set({ loading: false });
    }
  },

  updateLocation: async (location: Location) => {
    const { checkAuth } = useAuthStore.getState();
    const token = localStorage.getItem("jwt");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      await axiosInstance.put("/users/update-profile", location, config);
    } catch (error: any) {
      toast.error("Something went wrong");
    } finally {
    }
  },
}));
