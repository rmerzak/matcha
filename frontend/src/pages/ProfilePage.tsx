import { Star } from "lucide-react";
import { Header } from "../components/Header";
import PageTitle from "../components/PageTitle";
import useAuthStore from "../store/useAuthStore";
import { Link } from "react-router-dom";
import Analytics from "../components/Analytics";
import Bio from "../components/Bio";
import Interests from "../components/Interests";
import { users } from "../users";
import HybridLocationComponent from "../components/HybridLocationComponent";
import EditLocationComponent from "../components/EditLocationComponent";

export default function ProfilePage() {
  const { authUser } = useAuthStore();
  console.log(authUser?.profilePicture);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col py-2  px-4 sm:px-6 lg:px-8">
        <PageTitle title="Profile" />
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
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
                <HybridLocationComponent />
                <div className="flex text-gray-700 text-sm space-x-1 mt-3">
                  <Star size={18} /> <span>Fame rating: {6.6}</span>
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
            <Analytics
              numberOfProfileViews={users.slice(0, 13).length}
              numberOfLikes={users.slice(0, 5).length}
            />
            <Bio bio={authUser?.bio} />
            <Interests interests={authUser?.interests as []} />
            <div className="flex flex-col space-y-2">
              <h2 className="font-bold text-base">Pictures</h2>
              <div className="flex gap-2 flex-wrap justify-center">
                {authUser?.pictures?.map((picture, index) => (
                  <img
                    key={index}
                    src={picture}
                    className="w-60 h-full object-cover"
                  />
                ))}
                
              </div>
            </div>
            {/* <EditLocationComponent /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
