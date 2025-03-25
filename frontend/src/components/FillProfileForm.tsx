import React, { useRef, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { useNavigate } from "react-router-dom";
import GenderSelect from "./GenderSelect";
import SexualPreferenceSelect from "./SexualPreferenceSelect";
import BioInput from "./BioInput";
import InterestsSelect from "./InterestsSelect";
import ProfilePictureUpload from "./ProfilePictureUpload";
import PicturesUpload from "./PicturesUpload";

function FillProfileForm() {
  const [profilePicture, setProfilePicture] = useState<
    string | ArrayBuffer | null
  >(null);
  const [gender, setGender] = useState("");
  const [sexualPreference, setSexualPreference] = useState("bisexual");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<
    { value: string; label: string }[]
  >([]);
  const [pictures, setPictures] = useState<string[]>([]);

  const navigate = useNavigate();

  const { authUser, checkAuth } = useAuthStore();
  const { loading, updateProfile } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        gender,
        sexual_preferences: sexualPreference,
        bio,
        interests: interests,
        profile_picture: profilePicture,
        additional_pictures: pictures,
      });
      checkAuth();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const options = [
    { value: "vegan", label: "#vegan" },
    { value: "geek", label: "#geek" },
    { value: "piercing", label: "#piercing" },
    { value: "cars", label: "#cars" },
    { value: "movies", label: "#movies" },
    { value: "books", label: "#books" },
    { value: "music", label: "#music" },
  ];

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProfilePictureUpload
            profilePicture={profilePicture}
            setProfilePicture={setProfilePicture}
          />
          <GenderSelect gender={gender} setGender={setGender} />
          {/* <SexualPreferenceSelect
            sexualPreference={sexualPreference}
            setSexualPreference={setSexualPreference}
          /> */}
          <BioInput bio={bio} setBio={setBio} />
          <InterestsSelect
            interests={interests}
            setInterests={setInterests}
            options={options}
          />
          <PicturesUpload pictures={pictures} setPictures={setPictures} />

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
        </form>
      </div>
    </div>
  );
}

export default FillProfileForm;
