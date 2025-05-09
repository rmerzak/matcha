import React, { useEffect } from "react";
import { useLikesStore } from "../store/useLikesStore";
import useAuthStore from "../store/useAuthStore";

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
        className="inline-flex items-center px-4 py-2 border-purple-300 rounded-md shadow-sm
            text-sm font-bold text-purple-700 hover:bg-white bg-purple-50 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-purple-500 self-start mt-2 cursor-pointer border-2 "
      >
        UnLike
      </button>
    );
  }
  return (
    <button
      onClick={handleLike}
      className="inline-flex items-center px-4 py-2 border-purple-300 rounded-md shadow-sm
          text-sm font-bold text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2
          focus:ring-offset-2 focus:ring-purple-500 self-start mt-2 cursor-pointer border-2 "
    >
      Like
    </button>
  );
};

export default LikeButton;
