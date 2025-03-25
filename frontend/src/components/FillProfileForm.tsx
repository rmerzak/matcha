import clsx from "clsx";
import React, { useRef, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import GenderSelect from "./GenderSelect";
import SexualPreferenceSelect from "./SexualPreferenceSelect";
import BioInput from "./BioInput";
import InterestsSelect from "./InterestsSelect";

function FillProfileForm() {
  const [gender, setGender] = useState("");
  const [sexualPreference, setSexualPreference] = useState("bisexual");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<
    { value: string; label: string }[]
  >([]);
  const [pictures, setPictures] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const { authUser, checkAuth } = useAuthStore();
  const { loading, updateProfile } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let profilePicture = "";
    if (pictures.length > 0) profilePicture = pictures[0];

    try {
      await updateProfile({
        gender,
        sexual_preferences: sexualPreference,
        bio,
        interests: interests,
        profile_picture: profilePicture,
        additional_pictures: pictures.slice(1),
      });
      checkAuth();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const addPicture = (newPicture: any) => {
    const picturesToAdd = Array.isArray(newPicture) ? newPicture : [newPicture];
    const canAdd = 5 - pictures.length;
    if (canAdd > 0) {
      const newPictures = picturesToAdd.slice(0, canAdd);
      setPictures((prevPictures: any) => [...prevPictures, ...newPictures]);
    } else {
      console.warn("Cannot add more images; limit reached.");
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addPicture(reader.result);
      };

      reader.readAsDataURL(file);
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
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
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
          {/* PICTURES */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pictures
            </label>
            <div className="mt-1 mb-1 flex items-center flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
              text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
              focus:ring-offset-2 focus:ring-purple-500 flex-col"
              >
                <span>Upload Picture</span>
              </button>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                multiple
                disabled={pictures.length >= 5}
              />
            </div>
            <span className="ml-2 text-sm text-gray-400">
              Up to {5 - pictures.length} pictures
            </span>
            <p className="ml-2 text-sm text-gray-400">
              {pictures.length}/5 pictures uploaded.
            </p>
          </div>
          <span className="text-sm ml-2 text-gray-400">
            First one will be used as a profile picture
          </span>
          <div className="flex gap-2 flex-wrap">
            {pictures.map((image: any, index: any) => (
              <img
                key={index}
                src={image}
                alt={`Uploaded image ${index}`}
                className="w-24 h-full object-cover rounded-md"
              />
            ))}
          </div>

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
