import React, { useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import { useBlockStore } from "../store/useBlockStore";

interface BlockButtonProps {
  userId: string;
}

const BlockButton: React.FC<BlockButtonProps> = ({ userId }) => {
  const { isBlocked, addBock, getBlockStatus, removeBlock } = useBlockStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    getBlockStatus(userId);
  }, [userId, isBlocked, getBlockStatus]);

  const handleUnLike = () => {
    removeBlock(userId);
  };

  const handleLike = () => {
    addBock(userId);
  };
  if (!authUser?.profilePicture) return;
  if (isBlocked) {
    return (
      <button
        onClick={handleUnLike}
        className="inline-flex items-center px-4 py-2 border-gray-300 rounded-md shadow-sm
            text-sm font-bold text-gray-700 hover:bg-white bg-gray-50 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-gray-500 self-start mt-2 cursor-pointer border-2 "
      >
        Unblock
      </button>
    );
  }
  return (
    <button
      onClick={handleLike}
      className="inline-flex items-center px-4 py-2 border-gray-300 rounded-md shadow-sm
          text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
          focus:ring-offset-2 focus:ring-gray-500 self-start mt-2 cursor-pointer border-2 "
    >
      Block
    </button>
  );
};

export default BlockButton;
