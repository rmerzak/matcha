import React from "react";

interface BioInputProps {
  bio: string;
  setBio: (bio: string) => void;
}

const BioInput: React.FC<BioInputProps> = ({ bio, setBio }) => {
  return (
    <div>
      <label
        htmlFor="bio"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Bio
      </label>
      <div className="mt-1">
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        />
      </div>
    </div>
  );
};

export default BioInput;