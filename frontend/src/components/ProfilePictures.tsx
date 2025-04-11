import React from "react";

interface ProfilePicturesProps {
  pictures?: string[]; 
}

const ProfilePictures: React.FC<ProfilePicturesProps> = ({ pictures }) => {
  return (
    <div className="flex flex-col space-y-2">
      <h2 className="font-bold text-base">Pictures</h2>
      <div className="flex gap-2 flex-wrap justify-center">
        {pictures?.map((picture, index) => (
          <img
            key={index}
            src={picture}
            alt={`Profile picture ${index + 1}`}
            className="w-60 h-full object-cover"
          />
        ))}
      </div>
    </div>
  );
};

export default ProfilePictures;