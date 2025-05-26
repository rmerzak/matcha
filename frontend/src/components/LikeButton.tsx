import React, { useEffect } from "react";
import { useLikesStore } from "../store/useLikesStore";
import useAuthStore from "../store/useAuthStore";
import { Heart, HeartOff } from "lucide-react";

interface LikeButtonProps {
  likedUserId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ likedUserId }) => {
  const { isLiked, addLike, getLikeStatus, removeLike } = useLikesStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    getLikeStatus(likedUserId);
  }, [likedUserId, isLiked, getLikeStatus]);

  const handleUnLike = () => {
    removeLike(likedUserId);
  };

  const handleLike = () => {
    addLike(likedUserId);
  };
  if (!authUser?.profilePicture) return;
  if (isLiked) {
    return (
      <button
        onClick={handleUnLike}
        className="inline-flex items-center px-4 py-2  rounded-lg shadow-sm
          text-sm font-bold text-purple-600 bf-white hover:bg-purple-50 md:w-28 text-justify
           self-start mt-2 cursor-pointer border-2 justify-center gap-1"
      >
        <HeartOff size={20} />
        <span className=" md:block hidden">Unlike</span>
      </button>
    );
  }
  return (
    <button
      onClick={handleLike}
      className="inline-flex items-center px-4 py-2  rounded-lg shadow-sm
          text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 md:w-28 text-justify
           self-start mt-2 cursor-pointer border-2 justify-center gap-1"
    >
      <Heart size={20} /> 
      <span className="text-md md:block hidden ">Like</span>
    </button>
  );
};

export default LikeButton;
