import { House, MapPin } from "lucide-react";
import { Header } from "../components/Header";
import PageTitle from "../components/PageTitle";
import useAuthStore from "../store/useAuthStore";
import { Link } from "react-router-dom";
import Analytics from "../components/Analytics";
import Bio from "../components/Bio";
import Interests from "../components/Interests";

export default function ProfilePage() {
  const { authUser } = useAuthStore();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col py-2  px-4 sm:px-6 lg:px-8">
        <PageTitle title="Profile" />
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-gray-200 space-y-2">
            <div className="flex justify-between">
              <img
                src={authUser?.profilePicture}
                alt="Profile picture"
                className=" object-cover border-2 border-white"
              />
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold mb-1">
                  {authUser?.firstName} {authUser?.lastName}
                </span>
                <div className="flex text-gray-700 text-sm space-x-1">
                  <House size={18} /> <span>Lives in Alaska</span>
                </div>
                <div className="flex text-gray-700 text-sm space-x-1">
                  <MapPin size={18} /> <span>30 kilometers away</span>
                </div>
              </div>
              <Link
                to="/edit-profile"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
                    text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
                    focus:ring-offset-2 focus:ring-purple-500 self-start mt-2"
              >
                Edit Profile
              </Link>
            </div>
            <Analytics numberOfProfileViews={31} numberOfLikes={5} />
            <Bio bio={authUser?.bio} />
            <Interests interests={authUser?.interests as []} />
          </div>
        </div>
      </div>
    </div>
  );
}
