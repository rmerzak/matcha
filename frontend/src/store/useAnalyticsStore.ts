import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

type AnalyticsStoreType = {
  profileViews: [];
  likes: [];
  getProfileViews: () => Promise<void>;
  getLikes: () => Promise<void>;

};

export const useAnalyticsStore = create<AnalyticsStoreType>((set) => ({
  profileViews: [],
  likes: [],

  getProfileViews: async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axiosInstance.get("/views/get-my-views", config);
      set({profileViews: res.data.data.result})
    } catch (error) {
      console.log(error)
    }
  },
  getLikes: async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axiosInstance.get("/likes/received", config);
      set({likes: res.data.data.users})
      console.log(res.data.data.users)
    } catch (error) {
      console.log(error)
    }
  },
}));
