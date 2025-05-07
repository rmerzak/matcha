import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

type BlockStoreType = {
  isBlocked: boolean;
  addBock: (user_id: string) => Promise<void>;
  removeBlock: (user_id: string) => Promise<void>;
  getBlockStatus: (user_id: string) => Promise<void>;
  blockedProfiles: [];
  getBlockedProfiles: () => Promise<void>;
};

export const useBlockStore = create<BlockStoreType>((set) => ({
  isBlocked:false,
  blockedProfiles: [],

  getBlockedProfiles: async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Please log in to view matches");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params : {
          page: 1,
          items_per_page: 900,
        }
      };
      const res = await axiosInstance.get("/blocks/get-blocked-users", config);
      const profilesData = res.data.data.users || [];

      set({ blockedProfiles: profilesData });
    } catch (error: any) {
      console.error("Error fetching matches:", error.response ? error.response.data : error.message);
      set({ blockedProfiles: [] });
      toast.error(error.response?.data?.detail || "Failed to fetch matches");
    } finally {
    }
  },
  getBlockStatus: async (user_id: string) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          blocked_user_id: user_id,
        },
      };
      const res = await axiosInstance.get(`/blocks/check-block`, config);
	  set({isBlocked: res.data.data.is_blocked})
    } catch (error: any) {
      console.log(error.response);
    }
  },
  addBock: async (user_id: string) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          blocked_user_id: user_id,
        },
      };
      await axiosInstance.post("/blocks/add-block", null, config);
	  set({isBlocked: true})
    } catch (error: any) {
      console.log(error.response);
    }
  },
  removeBlock: async (user_id: string) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          blocked_user_id: user_id,
        },
      };
      await axiosInstance.delete(`/blocks/remove-block`, config);
	  set({isBlocked: false})
    } catch (error: any) {
      console.log(error.response);
    }
  },
}));
