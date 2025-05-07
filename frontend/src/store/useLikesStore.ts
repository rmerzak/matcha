import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

type LikesStoreType = {
  isLiked: boolean;
  addLike: (liked_user_id: string) => Promise<void>;
  removeLike: (user_id: string) => Promise<void>;
  getLikeStatus: (user_id: string) => Promise<void>;
};

export const useLikesStore = create<LikesStoreType>((set) => ({
  isLiked:false,
  getLikeStatus: async (user_id: string) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axiosInstance.get(`/likes/status/${user_id}`, config);
	  set({isLiked: res.data.data.i_liked_them})
    } catch (error: any) {
      console.log(error.response);
    }
  },
  addLike: async (liked_user_id: string) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          liked_user_id,
        },
      };
      await axiosInstance.post("/likes/add-like", null, config);
	  set({isLiked: true})
    } catch (error: any) {
      console.log(error.response);
    }
  },
  removeLike: async (user_id: string) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axiosInstance.delete(`/likes/unlike/${user_id}`, config);
	  set({isLiked: false})
    } catch (error: any) {
      console.log(error.response);
    }
  },

}));
