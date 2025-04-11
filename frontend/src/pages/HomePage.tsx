import { useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { useMatchStore } from "../store/useMatchStore";
import { Header } from "../components/Header";
import { Frown } from "lucide-react";
import { users } from "../users";
import Suggestion from "../components/Suggestion";
import Filters from "../components/Filters";
import SideFilters from "../components/SideFilters";

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
          <Filters />
          <div className="flex">
            <SideFilters />
            <main className="flex-grow flex flex-col gap-10 p-4 relative overflow-hidden">
              {users.length > 0 && !isLoadingUserProfiles && (
                <div className="lg:flex-col lg:flex gap-2 grid grid-cols-2 md:grid-cols-3 md:gap-3">
                  {users.slice(0, 19).map((user, index) => (
                    <Suggestion user={user} key={index} />
                  ))}
                </div>
              )}
              {users.length === 0 && !isLoadingUserProfiles && (
                <NoMoreProfiles />
              )}
              {isLoadingUserProfiles && <LoadingUI />}
            </main>
          </div>
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
