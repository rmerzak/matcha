import {create} from "zustand"
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

type UserStoreType = {
    loading: boolean;
    updateProfile: (data: any) => Promise<void>;
}

type DataType = {
    gender: string;
    genderPreference: string;
    bio: string;
    interests: string[];
    pictures: string[] 
}

export const useUserStore = create<UserStoreType>((set) => ({
    loading: false,

    updateProfile: async (data: DataType) => {
        const token = localStorage.getItem("jwt");
        const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        const profileUpdate = {
            gender: data.gender,
            sexual_preferences: data.genderPreference,
            bio: data.bio,
            interests: data.interests
        }
        // console.log("/update-profile", profileUpdate);
        try {
            set({loading: true})
            await axiosInstance.put("/users/update-profile", profileUpdate, config)
            toast.success("Profile updated successfully")
        } catch (error: any) {
            toast.error(error.response.data.message || "Something went wrong")
        } finally {
            set({loading: false})
        }
    },
}));