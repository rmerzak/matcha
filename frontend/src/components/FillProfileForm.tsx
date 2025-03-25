import clsx from 'clsx';
import React, { useRef, useState } from 'react'
import useAuthStore from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function FillProfileForm() {
      const navigate = useNavigate();
    
    const { authUser, checkAuth } = useAuthStore();

      const { loading, updateProfile } = useUserStore();
      const [gender, setGender] = useState("");
      const [sexualPreference, setSexualPreference] = useState("bisexual");
      const [bio, setBio] = useState("");
      const [interests, setInterests] = useState<any>([]);
      const [pictures, setPictures] = useState<string[]>([]);
    
      const fileInputRef = useRef<HTMLInputElement>(null);
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let profilePicture = "";
        if (pictures.length > 0)
            profilePicture = pictures[0]
    
        try {
          await updateProfile({
            gender,
            sexual_preferences: sexualPreference,
            bio,
            interests: interests.map((interest: any) => (interest.value)),
            profile_picture: profilePicture,
            additional_pictures: pictures.slice(1)
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
    
      const controlStyles = {
        base: "border rounded-lg bg-white hover:cursor-pointer",
        focus: "ring-1 ring-purple-700",
        nonFocus: "border-gray-300 hover:border-gray-400",
      };
      const placeholderStyles = "text-gray-500 pl-1 py-0.5 text-sm";
      const selectInputStyles = "pl-1 py-0.5";
      const valueContainerStyles = "p-1 gap-1";
      const singleValueStyles = "leading-7 ml-1";
      const multiValueStyles =
        "bg-gray-100 rounded items-center py-0.5 pl-2 pr-1 gap-1.5";
      const multiValueLabelStyles = "leading-6 py-0.5";
      const multiValueRemoveStyles =
        "border border-gray-200 bg-white hover:bg-red-50 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md";
      const indicatorsContainerStyles = "p-1 gap-1";
      const clearIndicatorStyles =
        "text-gray-500 p-1 rounded-md hover:bg-red-50 hover:text-red-800";
      const indicatorSeparatorStyles = "bg-gray-300";
      const dropdownIndicatorStyles =
        "p-1 hover:bg-gray-100 text-gray-500 rounded-md hover:text-black";
      const menuStyles = "p-1 mt-2 border border-purple-200 bg-white rounded-lg";
      const groupHeadingStyles = "ml-3 mt-2 mb-1 text-gray-500 text-sm";
      const optionStyles = {
        base: "hover:cursor-pointer px-3 py-2 rounded",
        focus: "bg-gray-100 active:bg-gray-200",
        selected:
          "after:content-['✔'] after:ml-2 after:text-green-500 text-gray-500",
      };
      const noOptionsMessageStyles =
        "text-gray-500 p-2 bg-gray-50 border border-dashed border-gray-200 rounded-sm";
    
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GENDER */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </span>
          <div className="flex space-x-4">
            {["Male", "Female"].map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  required
                  type="radio"
                  style={{
                    accentColor: "#7E22CE",
                  }}
                  className=""
                  name="gender"
                  value={option.toLocaleLowerCase()}
                  onChange={() => setGender(option.toLocaleLowerCase())}
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        </div>
        {/* GENDER PREFERENCE */}
        {/* <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Gender Preference
          </span>
          <div className="flex space-x-4">
            {["heterosexual", "homosexual", "bisexual"].map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="checkbox"
                  style={{
                    accentColor: "#7E22CE",
                  }}
                  className="form-checkbox"
                  checked={
                    sexualPreference.toLowerCase() ===
                    option.toLowerCase()
                  }
                  onChange={() =>
                    setSexualPreference(option.toLowerCase())
                  }
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        </div> */}
        {/* BIO */}
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
        {/* INTERESTS */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </span>
          <div>
            <Select
              isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              unstyled
              styles={{
                input: (base) => ({
                  ...base,
                  "input:focus": {
                    boxShadow: "none",
                  },
                }),
                // On mobile, the label will truncate automatically, so we want to
                // override that behaviour.
                multiValueLabel: (base) => ({
                  ...base,
                  whiteSpace: "normal",
                  overflow: "visible",
                }),
                control: (base) => ({
                  ...base,
                  transition: "none",
                }),
              }}
              classNames={{
                control: ({ isFocused }) =>
                  clsx(
                    isFocused
                      ? controlStyles.focus
                      : controlStyles.nonFocus,
                    controlStyles.base
                  ),
                placeholder: () => placeholderStyles,
                input: () => selectInputStyles,
                valueContainer: () => valueContainerStyles,
                singleValue: () => singleValueStyles,
                multiValue: () => multiValueStyles,
                multiValueLabel: () => multiValueLabelStyles,
                multiValueRemove: () => multiValueRemoveStyles,
                indicatorsContainer: () => indicatorsContainerStyles,
                clearIndicator: () => clearIndicatorStyles,
                indicatorSeparator: () => indicatorSeparatorStyles,
                dropdownIndicator: () => dropdownIndicatorStyles,
                menu: () => menuStyles,
                groupHeading: () => groupHeadingStyles,
                option: ({ isFocused, isSelected }) =>
                  clsx(
                    isFocused && optionStyles.focus,
                    isSelected && optionStyles.selected,
                    optionStyles.base
                  ),
                noOptionsMessage: () => noOptionsMessageStyles,
              }}
              value={interests}
              onChange={setInterests}
              options={options}
            />
          </div>
        </div>
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
  )
}

export default FillProfileForm