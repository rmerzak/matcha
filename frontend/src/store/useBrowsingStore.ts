import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

type BrowsingStoreType = {
  suggestions: Suggestion[];
  getSuggestions: (page?: number) => Promise<void>;
  isLoadingSuggestions: boolean;
  sortBy: "age" | "fame_rating" | null;
  setSortBy: (element: "age" | null | "fame_rating") => void;
  sortOrder: "asc" | "desc" | null;
  setSortOrder: (order: "asc" | "desc" | null) => void;
  minAge: number | null;
  maxAge: number | null;
  setMinAge: (age: number | null) => void;
  setMaxAge: (age: number | null) => void;
  minFameRating: number | null;
  maxFameRating: number | null;
  setMinFameRating: (minFameRating: number | null) => void;
  setMaxFameRating: (maxFameRating: number | null) => void;
};

type Suggestion = {
  id: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  password?: string | null;
  gender?: string | null;
  sexual_preferences?: string | null;
  interests: string[];
  pictures: string[];
  fame_rating?: number | null;
  location?: string | null;
  latitude?: number | null;
  address?: string | null;
  age?: number | null;
  bio?: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  common_tag_count: number;
};

export const useBrowsingStore = create<BrowsingStoreType>((set, get) => ({
  suggestions: [],
  isLoadingSuggestions: false,
  sortBy: null,
  sortOrder: null,
  minAge: null,
  maxAge: null,
  minFameRating: null,
  maxFameRating: null,

  setMinAge: (age: number | null) => {
    set({ minAge: age });
  },

  setMaxAge: (age: number | null) => {
    set({ maxAge: age });
  },

  setMinFameRating: (minFameRating: number | null) => {
    set({ minFameRating: minFameRating });
  },

  setMaxFameRating: (maxFameRating: number | null) => {
    set({ maxFameRating: maxFameRating });
  },

  setSortBy: (element: "age" | "fame_rating" | null) => {
    set({ sortBy: element });
  },

  setSortOrder: (order: "asc" | "desc" | null) => {
    set({ sortOrder: order });
  },

  getSuggestions: async () => {
    const token = localStorage.getItem("jwt");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        sort_by: get().sortBy,
        sort_order: get().sortOrder,
        min_age: get().minAge,
        max_age: get().maxAge,
        min_fame: get().minFameRating,
        max_fame: get().maxFameRating,
      },
    };
    try {
      set({ isLoadingSuggestions: true });
      const res = await axiosInstance.get("/users/browse", config);
      const profiles = res.data.data.profiles || [];
      set({
        suggestions: profiles,
        isLoadingSuggestions: false,
      });
    } catch (error) {
      set({ suggestions: [] });
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      set({ isLoadingSuggestions: false });
    }
  },
}));
