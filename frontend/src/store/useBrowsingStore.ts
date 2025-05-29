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
  commonTags: string[];
  setCommonTags: (tags: string[]) => void;
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
  commonTags: [],

  setCommonTags: (tags: string[]) => {
    set({ commonTags: tags });
  },

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
    
    // Build query parameters manually to handle arrays properly
    const params = new URLSearchParams();
    
    if (get().sortBy) params.append('sort_by', get().sortBy as string);
    if (get().sortOrder) params.append('sort_order', get().sortOrder as string);
    if (get().minAge !== null && get().minAge !== undefined) params.append('min_age', String(get().minAge));
    if (get().maxAge !== null && get().maxAge !== undefined) params.append('max_age', String(get().maxAge));
    if (get().minFameRating !== null && get().minFameRating !== undefined) params.append('min_fame', String(get().minFameRating));
    if (get().maxFameRating !== null && get().maxFameRating !== undefined) params.append('max_fame', String(get().maxFameRating));
    
    // Handle common_tags array properly
    get().commonTags.forEach(tag => {
      params.append('common_tags', tag);
    });

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    console.log(params.toString());
    
    try {
      set({ isLoadingSuggestions: true });
      const res = await axiosInstance.get(`/users/browse?${params.toString()}`, config);
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
