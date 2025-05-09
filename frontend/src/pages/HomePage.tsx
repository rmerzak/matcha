import { useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { Frown } from "lucide-react";
import Suggestion from "../components/Suggestion";
import Filters from "../components/Filters";
import SideFilters from "../components/SideFilters";
import { useBrowsingStore } from "../store/useBrowsingStore";
import SuggestionsList from "../components/SuggestionsList";

function HomePage() {
  const { suggestions, isLoadingSuggestions, getSuggestions } =
    useBrowsingStore();

  useEffect(() => {
    getSuggestions();
  }, [getSuggestions]);

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-red-100 via-purple-100 to-blue-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-grow flex-col h-screen">
        <Header />
        <div className="flex flex-col">
          <Filters />
          <div className="flex">
            <SideFilters />
            <main className="flex-grow flex flex-col gap-10 p-4 relative h-screen ">
              {/* <LoadingUI /> */}
              {suggestions.length > 0 && !isLoadingSuggestions && (
                <SuggestionsList suggestions={suggestions.slice(0, 10)} />
              )}
              {suggestions.length === 0 && !isLoadingSuggestions && (
                <NoMoreProfiles />
              )}
              {isLoadingSuggestions && <LoadingUI />}
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
    <div className="flex flex-col gap-3">
    <div className="relative w-full">
      <div className="card bg-white rounded-lg h-48 border border-gray-200 shadow-sm flex">
        <div className="px-4 pt-4 h-44 w-60">
          <div className="w-full h-full bg-gray-200 rounded-lg" />
        </div>
        <div className="card-body bg-gradient-to-b from-white to-pink-50 p-4 flex flex-col w-full">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-1/6" />
          </div>
        </div>
      </div>
    </div>
    <div className="relative w-full">
      <div className="card bg-white rounded-lg h-48 border border-gray-200 shadow-sm flex">
        <div className="px-4 pt-4 h-44 w-60">
          <div className="w-full h-full bg-gray-200 rounded-lg" />
        </div>
        <div className="card-body bg-gradient-to-b from-white to-pink-50 p-4 flex flex-col w-full">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-1/6" />
          </div>
        </div>
      </div>
    </div>

    <div className="relative w-full">
      <div className="card bg-white rounded-lg h-48 border border-gray-200 shadow-sm flex">
        <div className="px-4 pt-4 h-44 w-60">
          <div className="w-full h-full bg-gray-200 rounded-lg" />
        </div>
        <div className="card-body bg-gradient-to-b from-white to-pink-50 p-4 flex flex-col w-full">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-1/6" />
          </div>
        </div>
      </div>
    </div>

    </div>
  );
};

export default HomePage;
