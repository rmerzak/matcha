import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import AgeRangeSlider from "../components/AgeRangeSlider";
import useAuthStore from "../store/useAuthStore";
import { useBrowsingStore } from "../store/useBrowsingStore";
import { useNavigate } from "react-router-dom";

interface CheckedItems {
  [key: string]: boolean;
}

function SearchPage() {
  const { authUser } = useAuthStore();
  const {
    getSuggestions,
    setMinAge,
    setMaxAge,
    setMinFameRating,
    setMaxFameRating,
    setCommonTags
  } = useBrowsingStore();

  const [ageRangeValues, setAgeRangeValues] = useState({ min: 18, max: 80 });
  // const [frRangeValues, setFrRangeValues] = useState({ min: 4, max: 10 });
  const navigate = useNavigate();

  const handleAgeRangeChange = (value: any) => {
    setAgeRangeValues(value);
    setMinAge(value.min);
    setMaxAge(value.max);
  };

  const handleFrRangeChange = (value: any) => {
    setMinFameRating(value.min);
    setMaxFameRating(value.max);
  };

  const [checkedCommonTags, setCheckedCommonTags] = useState<CheckedItems>({});

  const handleChange = (event: any) => {
    setCheckedCommonTags({
      ...checkedCommonTags,
      [event.target.name]: event.target.checked,
    });
  };

  const showResults = () => {
    const checked = Object.keys(checkedCommonTags).filter(
      (key) => checkedCommonTags[key]
    );
    setCommonTags(checked.map((item) => item.replace(/^#/, "")));
    getSuggestions();
    navigate("/");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-red-100 via-purple-100  to-blue-100 overflow-hidden">
      <Sidebar />
      <div className="hidden">{ageRangeValues.max}</div>
      <div className="flex flex-grow flex-col overflow-hidden">
        <Header />
        <div
          className="flex flex-col space-y-12 bg-white m-8 p-8 rounded-lg
                        shadow-lg sm:mx-auto sm:w-full sm:max-w-2xl  "
        >
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
            <AgeRangeSlider min={0} max={500} onChange={handleFrRangeChange} />
          </div>
          <div className="flex flex-col gap-2 ">
            <h1 className="text-lg font-semibold">
              Select a <span className="text-purple-600">location</span> :
            </h1>
          </div>
          <div className="flex flex-col gap-2 ">
            <h1 className="text-lg font-semibold">
              Select a one or multiple{" "}
              <span className="text-purple-600">interest tags</span> :
            </h1>
            <div className="flex">
              {authUser?.interests?.map((option: any) => (
                <div key={option.label} className="flex gap-1 ml-2">
                  <input
                    type="checkbox"
                    style={{
                      accentColor: "#7E22CE",
                    }}
                    id={option.label}
                    name={option.label}
                    checked={checkedCommonTags[option.label] || false}
                    onChange={handleChange}
                  />
                  <label className="text-md" htmlFor={option.label}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={showResults}
            className="py-3 max-w-40 self-end  px-4 border rounded-lg text-white bg-purple-500"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
