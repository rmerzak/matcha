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
    interests: [{value: "", label: ""}];
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
        let profilePicture = "";
        if (data.pictures.length > 0)
            profilePicture = data.pictures[0]

        const profileUpdate = {
            gender: data.gender,
            sexual_preferences: data.genderPreference,
            bio: data.bio,
            interests: data.interests.map(interest => interest.value),
            profile_picture: profilePicture,
            additional_pictures: data.pictures.slice(1),
        }
        
        try {
            set({loading: true})
            await axiosInstance.put("/users/update-profile", profileUpdate, config)
            toast.success("Profile updated successfully!")
        } catch (error: any) {
            toast.error("Something went wrong")
        } finally {
            set({loading: false})
        }
    },
}));