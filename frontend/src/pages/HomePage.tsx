import { useCallback, useEffect, useRef } from "react";
import { Sidebar } from "../components/Sidebar";
import { useMatchStore } from "../store/useMatchStore";
import { Header } from "../components/Header";
import { Frown } from "lucide-react";
import { users } from "../users";
import Suggestion from "../components/Suggestion";
import Filters from "../components/Filters";
import SideFilters from "../components/SideFilters";

function HomePage() {
  const {
    getUserProfiles,
    userProfiles,
    isLoadingUserProfiles,
    currentPage,
    hasMore,
  } = useMatchStore();

  const observerTarget = useRef(null);
  const loadingRef = useRef(false);
  
  const stableGetUserProfiles = useCallback(() => {
    getUserProfiles(1);
  }, [getUserProfiles]); // Only recreate if getUserProfiles changes
  
  useEffect(() => {
    stableGetUserProfiles();
    return () => {
      if (observerTarget.current) {
        const observer = new IntersectionObserver(() => {}, {});
        observer.disconnect();
      }
    };
  }, [stableGetUserProfiles]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "-0px",
      threshold: 0.1, 
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingUserProfiles && !loadingRef.current) {
        loadingRef.current = true;
        getUserProfiles(currentPage + 1).finally(() => {
          loadingRef.current = false;
        });
      }
    }, options);

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingUserProfiles, currentPage, getUserProfiles]);

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-red-100 via-purple-100 to-blue-100 overflow-hidden"
    >
      <Sidebar />
      <div className="flex flex-grow flex-col overflow-hidden">
        <Header />
        <div className="flex flex-col">
          <Filters />
          <div className="flex">
            <SideFilters />
            <main className="flex-grow flex flex-col gap-10 p-4 relative overflow-hidden">
              {userProfiles.length > 0 && !isLoadingUserProfiles && (
                <div className="lg:flex-col lg:flex gap-2 grid grid-cols-2 md:grid-cols-3 md:gap-3">
                  {userProfiles.map((user: any, index) => (
                    <Suggestion user={user} key={user.id || index} />
                  ))}
                  {hasMore && (
                    <div ref={observerTarget} className="text-center py-4">
                      {isLoadingUserProfiles ? "Loading more..." : ""}
                    </div>
                  )}
                </div>
              )}
              {userProfiles.length === 0 && !isLoadingUserProfiles && (
                <NoMoreProfiles />
              )}
              {isLoadingUserProfiles && !hasMore && <LoadingUI />}
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
