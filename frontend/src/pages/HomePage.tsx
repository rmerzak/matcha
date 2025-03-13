import { useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { useMatchStore } from "../store/useMatchStore";
import { Header } from "../components/Header";
import { ChevronDown, Frown, MapPin, Star } from "lucide-react";
import { users } from "../users";
import { Link } from "react-router-dom";

function HomePage() {
  const { getUserProfiles, userProfiles, isLoadingUserProfiles } =
    useMatchStore();

  useEffect(() => {
    // getUserProfiles();
  }, [getUserProfiles]);

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-red-100 via-purple-100  to-blue-100
    overflow-hidden"
    >
      <Sidebar />
      <div className="flex flex-grow flex-col overflow-hidden">
        <Header />
        <div className="flex flex-col">
          <button className="flex divide-x  divide-gray-400 justify-end border border-gray-400">
            <div></div>
            <div className="text-sm px-6 py-2 text-purple-700 flex items-center gap-1 font-semibold">
              <span className="">Filters</span>
              <ChevronDown className="size-3" />
            </div>
          </button>
          <main className="flex-grow flex flex-col gap-10 p-4 relative overflow-hidden">
            {users.length > 0 && !isLoadingUserProfiles && (
              <div className="flex lg:flex-col gap-2 flex-wrap">
                {/* <>Users found</> */}
                {users.slice(0, 19).map((user, index) => (
                  <div
                    key={index}
                    className="w-40 border bg-white p-2 rounded-lg border-gray-200 shadow-sm
                  lg:w-full lg:flex lg:space-x-4"
                  >
                    <img
                      src={user.profilePicture}
                      className="h-44 w-44 object-cover rounded-lg "
                      alt=""
                    />
                    <div className="flex flex-col">
                      <span className="text-xl font-bold mb-1">
                        {user.firstName} {user.lastName}
                      </span>
                      <div className="flex flex-col text-gray-700 text-sm">
                        <div className="flex space-x-1 items-center">
                          <MapPin className="size-4" />{" "}
                          <span>{user.location}</span>
                        </div>
                        <div className="flex space-x-1 ">
                          <Star className="size-4" />{" "}
                          <span>Fame rating: {6.6}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.interests.map((interest: string, index) => (
                          <span
                            key={index}
                            className="border rounded-2xl text-xs px-2 inline-block"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                      <Link
                        to={`/users/${user.username}`}
                        className=" px-4 py-2 rounded-full font-semibold
                      text-sm bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2
                      focus:ring-offset-2 focus:ring-purple-500 text-center mt-3 text-black
                      "
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {users.length === 0 && !isLoadingUserProfiles && <NoMoreProfiles />}
            {isLoadingUserProfiles && <LoadingUI />}
          </main>
        </div>
      </div>
    </div>
  );
}

const NoMoreProfiles = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <Frown className="text-purple-400 mb-6" size={80} />
    <h2 className="text-3xl font-bold text-gray-800 mb-4">No users found</h2>
  </div>
);

const LoadingUI = () => {
  return (
    <div className="relative w-full max-w-sm h-[28rem]">
      <div className="card bg-white w-96 h-[28rem] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <div className="px-4 pt-4 h-3/4">
          <div className="w-full h-full bg-gray-200 rounded-lg" />
        </div>
        <div className="card-body bg-gradient-to-b from-white to-pink-50 p-4">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
