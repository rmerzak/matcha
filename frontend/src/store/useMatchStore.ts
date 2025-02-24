import toast from "react-hot-toast"
import {create} from "zustand"

type MatchStoreType = {
    loading: boolean;
    matches: [{ _id: string, name: string, image: undefined}] | [];
    getMyMatches: () => Promise<void>;
}

export const useMatchStore = create<MatchStoreType>((set) => ({
    matches: [],
    loading: false,

    getMyMatches: async () => {
        try {
            set({loading: true})
            // send a get request to endpoint
            // const res = await axiosInstance.get("/matches")
            // set({matches: res.data.matches})
            set({matches: [{ _id: "1", name: "Jane Doe", image: undefined }]})
        } catch (error) {
            set({matches: []})
            toast.error("Something went wrong")
        } finally {
            set({loading: false})
        }
    }

}))