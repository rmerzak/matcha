import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { useMatchStore } from "../store/useMatchStore";
import { Header } from "../components/Header";
import { Frown } from "lucide-react";
import AgeRangeSlider from "../components/AgeRangeSlider";

function SearchPage() {
  const { getUserProfiles, userProfiles, isLoadingUserProfiles } =
    useMatchStore();

  const [ageRangeValues, setAgeRangeValues] = useState({ min: 18, max: 80 });
  const [frRangeValues, setFrRangeValues] = useState({ min: 4, max: 10 });

  const handleAgeRangeChange = (value: any) => {
    setAgeRangeValues(value);
  };

  const handleFrRangeChange = (value: any) => {
    setAgeRangeValues(value);
  };

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
        <div className="flex flex-col space-y-12 bg-white m-8 p-8 rounded-lg
                        shadow-lg sm:mx-auto sm:w-full sm:max-w-2xl  ">
          <div className="flex flex-col gap-2 ">
            <h1 className="text-lg font-semibold">
              Select an <span className="text-purple-600">age</span> gap:
            </h1>
            <AgeRangeSlider min={18} max={80} onChange={handleAgeRangeChange} />
          </div>
          <div className="flex flex-col gap-2 ">
            <h1 className="text-lg font-semibold">
              Select a <span className="text-purple-600">fame rating</span> gap:
            </h1>
            <AgeRangeSlider min={4} max={10} onChange={handleFrRangeChange} />
          </div>
          <div>

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

export default SearchPage;
