import toast from "react-hot-toast";
import { create } from "zustand";
import { userProfile } from "./userProfiles";
import { axiosInstance } from "../lib/axios";

type User = {
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
};

type MatchStoreType = {
  isLoadingMyMatches: boolean;
  isLoadingUserProfiles: boolean;

  matches: [{ _id: string; name: string; image: undefined }] | [];
  userProfiles: User[] | [];
  getMyMatches: () => Promise<void>;
  getUserProfiles: (page?: number) => Promise<void>;
  currentPage: number;
  hasMore: boolean;
  sortBy: string | null;
  setSortBy: (by: string | null) => void;
  filterUserProfiles: () => void;
};

// Sort from low to high (ascending)
const sortByAgeLowToHigh = (arr: any) => {
  return arr.sort((a: any, b: any) => Number(a.age) - Number(b.age));
};

// Sort from high to low (descending)
const sortByAgeHighToLow = (arr: any) => {
  return arr.sort((a: any, b: any) => Number(b.age) - Number(a.age));
};

export const useMatchStore = create<MatchStoreType>((set, get) => ({
  isLoadingUserProfiles: false,
  userProfiles: [],
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
  isLoadingMyMatches: false,
  matches: [],
  sortBy: null,

  setSortBy: (by: string | null) => {
    set({ sortBy: by });
  },

  filterUserProfiles: () => {
    if (get().sortBy) {
      if (get().sortBy === "Age: Low to High") {
        set({userProfiles: sortByAgeLowToHigh(get().userProfiles)})
      }
      if (get().sortBy === "Age: High to Low") {
        set({userProfiles: sortByAgeHighToLow(get().userProfiles)})
      }
    }
  },

  getMyMatches: async () => {
    try {
      set({ isLoadingMyMatches: true });
      // send a get request to endpoint
      // const res = await axiosInstance.get("/matches")
      // set({matches: res.data.matches})
      set({ matches: [{ _id: "1", name: "Jane Doe", image: undefined }] });
    } catch (error) {
      set({ matches: [] });
      toast.error("Something went wrong");
    } finally {
      set({ isLoadingMyMatches: false });
    }
  },
  getUserProfiles: async (page = 1) => {
    const token = localStorage.getItem("jwt");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        limit: 10,
      },
    };
    try {
      set({ isLoadingUserProfiles: true });
      const res = await axiosInstance.get("/users/browse", config);

      const newProfiles = res.data.data.profiles || [];

      const hasMore =
        newProfiles.length === 0
          ? false
          : newProfiles.length >= config.params.limit;
      // console.log(res.data.data)
      // Update state with new profiles and pagination info
      set((state) => ({
        userProfiles:
          page === 1 ? newProfiles : [...state.userProfiles, ...newProfiles],
        currentPage: page,
        hasMore: hasMore,
        isLoadingUserProfiles: false,
      }));
    } catch (error) {
      set({ userProfiles: [] });
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      set({ isLoadingUserProfiles: false });
    }
  },
}));
