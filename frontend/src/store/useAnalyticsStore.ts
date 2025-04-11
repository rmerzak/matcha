import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import useAuthStore from "./useAuthStore";

type AnalyticsStoreType = {
  profileViews: [];
  likes: [];
  getProfileViews: () => Promise<void>;
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
      // send a get request to endpoint
      const res = await axiosInstance.get("/views/get-my-views", config);
      set({profileViews: res.data.data.result})
      // set({ matches: [{ _id: "1", name: "Jane Doe", image: undefined }] });
    } catch (error) {
      // set({ matches: [] });
      // toast.error("Something went wrong");
    } finally {
    }
  },
}));
