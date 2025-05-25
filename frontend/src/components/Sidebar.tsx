import { Heart, Loader, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMatchStore } from "../store/useMatchStore";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const { getMyMatches, matches, isLoadingMyMatches } = useMatchStore();

  const { id } = useParams();

  useEffect(() => {
    getMyMatches();
  }, [getMyMatches]);

  return (
    <>
      <div
        className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-md overflow-hidden transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0 z-20" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:w-1/4
        `}
      >
        <div className="flex flex-col h-full ">
          {/* Header */}
          <div className="p-4 pb-[27px] border-b border-purple-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-purple-600">Matches</h2>
            <button
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={toggleSidebar}
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-4 z-10 relative">
            {isLoadingMyMatches ? (
              <LoadingState />
            ) : matches.length === 0 ? (
              <NoMatchesFound />
            ) : (
              matches.map((match) => (
                <Link key={match.id} to={`/chat/${match.id}`}>
                  <div
                    className={`flex items-center mb-4 cursor-pointer hover:bg-purple-200 p-2 rounded-lg
                transition-colors duration-300 ${
                  match.id === id && "bg-purple-100"
                } `}
                  >
                    <img
                      src={match.profile_picture || "/avatar.png"}
                      alt="User avar"
                      className="size-12 object-cover rounded-full mr-3 border-2 border-purple-300"
                    />
                    <h3 className="font-semibold text-gray-800">
                      {match.first_name} {match.last_name}
                    </h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
      <button
        className="lg:hidden fixed top-3 left-4 p-2 bg-purple-500 text-white rounded-md z-10"
        onClick={toggleSidebar}
      >
        <MessageCircle size={24} />
      </button>
    </>
  );
};

const NoMatchesFound = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <Heart className="text-purple-400 mb-4" size={48} />
    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Matches Yet</h3>
    <p className="text-gray-500 max-w-xs">
      Don&apos;t worry! Your perfect match is just around the corner.
    </p>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <Loader className="text-purple-500 mb-4 animate-spin" size={48} />
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      Loading Matches
    </h3>
    <p className="text-gray-500 max-w-xs">
      We&apos;re finding your perfect matches. This might take a moment...
    </p>
  </div>
);
