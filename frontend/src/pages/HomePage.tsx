import { useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import Filters from "../components/Filters";
import SideFilters from "../components/SideFilters";
import { useBrowsingStore } from "../store/useBrowsingStore";
import SuggestionsList from "../components/SuggestionsList";
import { NoMoreProfiles } from "../components/NoMoreProfiles";
import { LoadingUI } from "../components/LoadingUI";

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
              {suggestions.length > 0 && !isLoadingSuggestions && (
                <SuggestionsList suggestions={suggestions} />
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

export default HomePage;
