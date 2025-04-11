import toast from "react-hot-toast";
import { create } from "zustand";
import { userProfile } from "./userProfiles";

type User = {
  id: string; // UUID represented as a string in TypeScript
  username: string; // varchar(255), required
  first_name?: string | null; // varchar(255), nullable
  last_name?: string | null; // varchar(255), nullable
  email?: string | null; // varchar(255), nullable, unique
  password?: string | null; // varchar(255), nullable (though typically required in practice)
  gender?: string | null; // varchar(255), nullable
  sexual_preferences?: string | null; // text, nullable
  interests: string[]; // text[], array of strings, required (empty array if no interests)
  pictures: string[]; // text[], array of strings, required (empty array if no pictures)
  fame_rating?: number | null; // numeric, nullable
  location?: string | null; // varchar(255), nullable
  latitude?: number | null; // numeric, nullable
  address?: string | null; // varchar(255), nullable
  age?: number | null; // numeric, nullable
  bio?: string | null; // text, nullable
  is_verified: boolean; // boolean, defaults to false, required
  created_at: string; // timestamp without time zone, represented as ISO string
  updated_at: string; // timestamp without time zone, represented as ISO string
};

type MatchStoreType = {
  isLoadingMyMatches: boolean;
  isLoadingUserProfiles: boolean;

  matches: [{ _id: string; name: string; image: undefined }] | [];
  userProfiles: User[] | [];
  getMyMatches: () => Promise<void>;
  getUserProfiles: () => Promise<void>;
};

export const useMatchStore = create<MatchStoreType>((set) => ({
  isLoadingMyMatches: false,
  isLoadingUserProfiles: false,
  matches: [],
  userProfiles: [],

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
  getUserProfiles: async () => {
    try {
      set({ isLoadingUserProfiles: true });
      // send a get request to endpoint
      // const res = await axiosInstance.get("/matches/user-profiles")
      // set({matches: res.data.users})
      set({
        userProfiles: userProfile
      });
    } catch (error) {
      set({ userProfiles: [] });
      toast.error("Something went wrong");
    } finally {
      set({ isLoadingUserProfiles: false });
    }
  },
}));
