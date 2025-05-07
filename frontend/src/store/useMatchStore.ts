import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

type Match = {
  id: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  fame_rating?: number | null;
  age?: number | null;
  bio?: string | null;
  profile_picture: string | null;
};

type MatchStoreType = {
  isLoadingMyMatches: boolean;

  matches: Match[];
  getMyMatches: () => Promise<void>;
};

export const useMatchStore = create<MatchStoreType>((set) => ({
  isLoadingMyMatches: false,
  matches: [],

  getMyMatches: async () => {
    try {
      set({ isLoadingMyMatches: true });
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
          connected: true,
        }
      };

      const res = await axiosInstance.get("/likes/received", config);
      console.log("API Response:", res.data.data.users);

      const matchesData = res.data.data.users || [];
      set({ matches: matchesData });
    } catch (error: any) {
      console.error("Error fetching matches:", error.response ? error.response.data : error.message);
      set({ matches: [] });
      toast.error(error.response?.data?.detail || "Failed to fetch matches");
    } finally {
      set({ isLoadingMyMatches: false });
    }
  },
}));
