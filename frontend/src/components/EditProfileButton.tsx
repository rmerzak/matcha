import React from "react";
import { Link } from "react-router-dom";

const EditProfileButton: React.FC = () => {
  return (
    <Link
      to="/edit-profile"
      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
          text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
          focus:ring-offset-2 focus:ring-purple-500 self-start mt-2"
    >
      Edit Profile
    </Link>
  );
};

export default EditProfileButton;