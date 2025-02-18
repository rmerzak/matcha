import {create} from "zustand"
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

type UserStoreType = {
    loading: boolean;
    updateProfile: (data: any) => Promise<void>;
}

export const useUserStore = create<UserStoreType>((set) => ({
    loading: false,

    updateProfile: async (data: any) => {
        console.log("updateProfile data", data);
        // try {
        //     set({loading: true})
        //     await axiosInstance.put("/users/update", data)
        //     toast.success("Profile updated successfully")
        // } catch (error: any) {
        //     toast.error(error.response.data.message || "Something went wrong")
        // } finally {
        //     set({loading: false})
        // }
    },
}));