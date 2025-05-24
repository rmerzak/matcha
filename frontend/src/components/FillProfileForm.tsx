import React, { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { useNavigate } from "react-router-dom";
import GenderSelect from "./GenderSelect";
// import SexualPreferenceSelect from "./SexualPreferenceSelect";
import BioInput from "./BioInput";
import InterestsSelect from "./InterestsSelect";
import ProfilePictureUpload from "./ProfilePictureUpload";
import PicturesUpload from "./PicturesUpload";
import SubmitButton from "./SubmitButton";
import BirthDatePicker from "./BirthDatePicker";
import UpdateLocation from "./UpdateLocation";

function FillProfileForm() {
  const [profilePicture, setProfilePicture] = useState<
    string | ArrayBuffer | null
  >(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isBirthDateValid, setIsBirthDateValid] = useState(false); // New state for validity
  const [gender, setGender] = useState("");
  const [sexualPreference] = useState("bisexual");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<
    { value: string; label: string }[]
  >([]);
  const [pictures, setPictures] = useState<string[]>([]);

  const navigate = useNavigate();

  const { checkAuth } = useAuthStore();
  const { loading, updateProfile } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !isBirthDateValid) {
      alert("You must be at least 18 years old to submit this form.");
      return;
    }
    try {
      await updateProfile({
        gender,
        sexual_preferences: sexualPreference,
        bio,
        interests: interests.map(
          (interest: { value: string; label: string }) => interest.value
        ),
        profile_picture: profilePicture,
        additional_pictures: pictures,
        date_of_birth: birthDate,
      });
      checkAuth();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const options = [
    { value: "technology", label: "#technology" },
    { value: "geek", label: "#geek" },
    { value: "sports", label: "#sports" },
    { value: "cars", label: "#cars" },
    { value: "movies", label: "#movies" },
    { value: "books", label: "#books" },
    { value: "music", label: "#music" },
  ];

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-5">
          <UpdateLocation />
          <ProfilePictureUpload
            profilePicture={profilePicture}
            setProfilePicture={setProfilePicture}
          />
          <BirthDatePicker
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            onValidityChange={setIsBirthDateValid} // Pass callback to update validity
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
          <SubmitButton loading={loading} />
        </form>
      </div>
    </div>
  );
}

export default FillProfileForm;
