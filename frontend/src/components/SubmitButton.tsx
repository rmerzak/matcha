import React from "react";

interface SubmitButtonProps {
  loading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading }) => {
  return (
    <button
      type="submit"
      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
        loading
          ? "bg-purple-400 cursor-not-allowed"
          : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      }`}
      disabled={loading}
    >
      {loading ? "Saving..." : "Save"}
    </button>
  );
};

export default SubmitButton;