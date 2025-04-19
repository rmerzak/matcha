import { Star } from "lucide-react";
import { Header } from "../components/Header";
import PageTitle from "../components/PageTitle";
import useAuthStore from "../store/useAuthStore";
import Analytics from "../components/Analytics";
import Bio from "../components/Bio";
import Interests from "../components/Interests";
import HybridLocationComponent from "../components/HybridLocationComponent";
import ProfilePictures from "../components/ProfilePictures";
import EditProfileButton from "../components/EditProfileButton";
import { useParams } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { useEffect } from "react";

export default function UsersPage() {
  const { username } = useParams();
  const {user, getUserByUsername} = useUserStore();

  useEffect(() => {
    getUserByUsername(username as string);
    console.log(user)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col py-2  px-4 sm:px-6 lg:px-8">
        <PageTitle title="Profile" />
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-gray-200 space-y-2">
            <div className="flex justify-between">
              <img
                src={user.profile_picture}
                alt="Profile picture"
                className=" object-cover border-2 border-white"
              />
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold mb-1">
                  {user.first_name} {user.last_name}
                </span>
                <HybridLocationComponent />
                <div className="flex text-gray-700 text-sm space-x-1 mt-3">
                  <Star size={18} /> <span>Fame rating: {user.fame_rating}</span>
                </div>
              </div>
              <EditProfileButton />
            </div>
            <Bio bio={""} />
            <Interests interests={user.interests} />
            <ProfilePictures pictures={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
