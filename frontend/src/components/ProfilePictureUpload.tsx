import React, { useRef } from "react";

interface ProfilePictureUploadProps {
  profilePicture: string | ArrayBuffer | null;
  setProfilePicture: (value: string | ArrayBuffer | null) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  profilePicture,
  setProfilePicture,
}) => {
  const fileInputRefProfilePic = useRef<HTMLInputElement>(null);

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string | ArrayBuffer);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Profile picture
      </label>
      <img
        className="w-48 mx-auto rounded-full h-48 object-cover border-2 border-white"
        src={(profilePicture as string) || "./avatar.png"}
        alt="profile picture"
      />
      <div className="mt-1 flex items-center justify-center space-x-4">
        <button
          type="button"
          onClick={() => setProfilePicture("")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
              text-sm font-medium text-gray-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2
              focus:ring-offset-2 focus:ring-red-500"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => fileInputRefProfilePic.current?.click()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
              text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
              focus:ring-offset-2 focus:ring-purple-500"
        >
          Upload new picture
        </button>
        <input
          type="file"
          ref={fileInputRefProfilePic}
          accept="image/*"
          className="hidden"
          onChange={handleProfilePictureChange}
        />
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
