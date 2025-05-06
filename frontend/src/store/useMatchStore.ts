import toast from "react-hot-toast";
import { create } from "zustand";
import { userProfile } from "./userProfiles";
import { axiosInstance } from "../lib/axios";
import { useUserStore } from "./useUserStore";
import useAuthStore from "./useAuthStore";

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
  common_tag_count: number;
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
  ageRange: { min: number; max: number };
  setAgeRange: (values: any) => void;
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
  ageRange: { min: 18, max: 80 },

  setAgeRange(values: any) {
    set({ ageRange: values });
  },

  setSortBy: (by: string | null) => {
    set({ sortBy: by });
  },

  filterUserProfiles: () => {
    const { authUser } = useAuthStore.getState();
    if (get().sortBy) {
      console.log(get().sortBy);
      console.log("before", get().userProfiles);
      if (get().sortBy === "Age: Low to High") {
        set({ userProfiles: sortByAgeLowToHigh(get().userProfiles) });
      }
      if (get().sortBy === "Age: High to Low") {
        set({ userProfiles: sortByAgeHighToLow(get().userProfiles) });
      }
      if (get().sortBy === "Location") {
        const targetLatitude = authUser?.latitude as unknown as number;
        const targetLongitude = authUser?.longitude as unknown as number;
        set({
          userProfiles: sortByDistance(
            get().userProfiles,
            targetLatitude,
            targetLongitude
          ),
        });
      }
      if (get().sortBy === "Fame rating: Low to High") {
        set({
          userProfiles: get().userProfiles.sort(
            (a, b) => Number(a.fame_rating) - Number(b.fame_rating)
          ),
        });
      }
      if (get().sortBy === "Fame rating: High to Low") {
        set({
          userProfiles: get().userProfiles.sort(
            (a, b) => Number(b.fame_rating) - Number(a.fame_rating)
          ),
        });
      }
      if (get().sortBy === "Common tags") {
        set({
          userProfiles: get().userProfiles.sort(
            (a, b) => Number(b.common_tag_count) - Number(a.common_tag_count)
          ),
        });
      }
      console.log("after", get().userProfiles);
    }
    console.log("before", get().userProfiles);
    set({
      userProfiles: get().userProfiles.filter((user) => {
        const age = user.age as number;
        return (
          !isNaN(age) && age >= get().ageRange.min && age <= get().ageRange.max
        );
      }),
    });
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
        items_per_page: 900,
      },
    };
    try {
      set({ isLoadingUserProfiles: true });
      const res = await axiosInstance.get("/users/browse", config);

      const newProfiles = res.data.data.profiles || [];
      console.log(newProfiles)

      set({
        userProfiles: newProfiles,
        isLoadingUserProfiles: false,
      });
    } catch (error) {
      set({ userProfiles: [] });
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      set({ isLoadingUserProfiles: false });
    }
  },
}));

function sortByDistance(
  users: User[],
  targetLat: number,
  targetLng: number
): User[] {
  // Convert target coordinates to radians
  const targetLatRad = toRadians(targetLat);
  const targetLngRad = toRadians(targetLng);

  // Sort users by distance from target coordinates
  return users.sort((a: any, b: any) => {
    const lat1 = toRadians(Number(a.latitude)); // Convert string to number and then to radians
    const lng1 = toRadians(Number(a.longitude));
    const lat2 = toRadians(Number(b.latitude));
    const lng2 = toRadians(Number(b.longitude));

    // Haversine formula
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    const aValue =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(aValue), Math.sqrt(1 - aValue));
    const radius = 6371; // Earth's radius in kilometers

    const distanceA = radius * c; // Distance to user a
    const distanceB = radius * c; // Distance to user b (recalculate for each)

    // Recalculate for b to ensure correct comparison
    const bLatRad = toRadians(Number(b.latitude));
    const bLngRad = toRadians(Number(b.longitude));
    const bDLat = bLatRad - targetLatRad;
    const bDLng = bLngRad - targetLngRad;

    const bAValue =
      Math.sin(bDLat / 2) * Math.sin(bDLat / 2) +
      Math.cos(targetLatRad) *
        Math.cos(bLatRad) *
        Math.sin(bDLng / 2) *
        Math.sin(bDLng / 2);

    const bC = 2 * Math.atan2(Math.sqrt(bAValue), Math.sqrt(1 - bAValue));
    const distanceBFinal = radius * bC;

    return distanceA - distanceBFinal; // Sort ascending (closest to farthest)
  });
}

// Helper function to convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
