import { useRef, useState } from "react";
import { Header } from "../components/Header";
import useAuthStore from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";

type Props = {};

function ProfilePage({}: Props) {
  const { authUser } = useAuthStore();

  // const [name, setName] = useState(authUser.name || "");
  // const [bio, setBio] = useState(authUser.bio || "");
  // const [age, setAge] = useState(authUser.age || "");
  // const [gender, setGender] = useState(authUser.gender || "");
  // const [genderPreference, setGenderPreference] = useState(authUser.genderPreference || []);
  // const [image, setImage] = useState(authUser.image || "");

  const [profilePicture, setProfilePicture] = useState<
    string | ArrayBuffer | null
  >(authUser?.pictures?.[0] || "./avatar.png");
  const [firstName, setFirstName] = useState(authUser?.firstName || "");
  const [lastName, setLastName] = useState(authUser?.lastName || "");

  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefProfilePic = useRef<HTMLInputElement>(null);

  const { loading, updateProfile } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log(profilePicture)
      const data = {};
      //   genderPreference === ""
      //     ? { gender, genderPreference: "both", bio, interests, pictures }
      //     : { gender, genderPreference, bio, interests, pictures };
      await updateProfile(data);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };
  const handleProfilePictureChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const handlePictureChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  console.log(image);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Your Profile
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* PROFILE PICTURE */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile picture
                </label>
                <img
                  className="w-48 mx-auto rounded-full h-48 object-cover border-2 border-white"
                  src={profilePicture as string}
                  alt="profile picture"
                />
                <div className="mt-1 flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setProfilePicture("./avatar.png")}
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
              {/* FIRST NAME */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>
              {/* LAST NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* GENDER */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </span>
                <div className="flex space-x-4">
                  {["Male", "Female"].map((option) => (
                    <label key={option} className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-pink-600"
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
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Gender Preference
                </span>
                <div className="flex space-x-4">
                  {["Male", "Female", "Both"].map((option) => (
                    <label key={option} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox text-pink-600"
                        checked={
                          genderPreference.toLowerCase() ===
                          option.toLowerCase()
                        }
                        onChange={() =>
                          setGenderPreference(option.toLowerCase())
                        }
                      />
                      <span className="ml-2">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* BIO */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700"
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
                placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  />
                </div>
              </div>
              {/* IMAGE */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover Image
                </label>
                <div className="mt-1 flex items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
                    text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
                    focus:ring-offset-2 focus:ring-pink-500"
                  >
                    Upload Image
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handlePictureChange}
                  />
                </div>
              </div>
              {image && (
                <div className="mt-4">
                  <img
                    src={image as string}
                    alt="User Image"
                    className="w-48 h-full object-cover rounded-md"
                  />
                </div>
              )}
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
      </div>
    </div>
  );
}

export default ProfilePage;
