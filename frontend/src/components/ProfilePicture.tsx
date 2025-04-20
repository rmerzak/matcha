import { FC } from "react";

interface ProfilePictureProps {
  profilePicture: string | undefined;
}

const ProfilePicture: FC<ProfilePictureProps> = ({ profilePicture }) => {
  return (
    <div className="flex justify-between">
      <img
        src={profilePicture || "/avatar.png"}
        alt="Profile picture"
        className="object-cover border-2 border-white"
      />
    </div>
  );
};

export default ProfilePicture;