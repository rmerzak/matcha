import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import qs from 'qs'; 

type AnalyticsStoreType = {
  profileViews: [];
  likes: [];
  getProfileViews: () => Promise<void>;
  getLikes: () => Promise<void>;
  addView: (user_id: string) => Promise<void>;

};

export const useAnalyticsStore = create<AnalyticsStoreType>((set) => ({
  profileViews: [],
  likes: [],

  addView: async (user_id: string) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      const data = qs.stringify({ user_id });
      await axiosInstance.post("/views/add-view", data, config);
    } catch (error) {
      console.log(error)
    }
  },

  getProfileViews: async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: 1,
          item_per_page: 1000,
        }
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
    } catch (error) {
      console.log(error)
    }
  },
}));
