import { useState } from "react";
import AgeRangeSlider from "./AgeRangeSlider";
import useAuthStore from "../store/useAuthStore";
import { useBrowsingStore } from "../store/useBrowsingStore";

interface CheckedItems {
  [key: string]: boolean;
}

function SideFilters() {
  const {setMinAge, setMaxAge } = useBrowsingStore();
  const { authUser } = useAuthStore();
  const [,setAgeRangeValues] = useState({ min: 18, max: 80 });
  // const [frRangeValues, setFrRangeValues] = useState({ min: 4, max: 10 });

  const [checkedCommonTags, setCheckedCommonTags] = useState<CheckedItems>({});

  const handleChange = (event: any) => {
    setCheckedCommonTags({
      ...checkedCommonTags,
      [event.target.name]: event.target.checked,
    });
  };

  const handleAgeRangeChange = (value: any) => {
    setAgeRangeValues(value);
    setMinAge(value.min);
    setMaxAge(value.max);
    // getSuggestions();
  };

  const handleFrRangeChange = (value: any) => {
    setAgeRangeValues(value);
  };

  return (
    <div className="hidden lg:block border-r border-gray-400">
      <div className="py-2 px-4 flex flex-col space-y-4 divide-y divide-gray-400">
        <h2 className="text-xl font-bold text-purple-600">Filters:</h2>
        <div className="flex flex-col space-y-10 divide-y divide-gray-400">
          <div className="flex flex-col gap-2 pt-3">
            <h3 className="text-lg font-bold text-gray-800">Age:</h3>
            <AgeRangeSlider min={18} max={80} onChange={handleAgeRangeChange}/>
          </div>
          {/* <div>
            <h3 className="text-lg font-semibold text-gray-800">Location: </h3>
          </div> */}
          <div className="flex flex-col gap-2  pt-3">
            <h3 className="text-lg font-semibold text-gray-800">Fame rating:</h3>
            <AgeRangeSlider min={4} max={10} onChange={handleFrRangeChange} />
          </div>
          <div className="flex flex-col gap-2  pt-3">
            <h3 className="text-lg font-semibold text-gray-800">Common tags:</h3>
            <div className="  ">
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
                  <label className="text-lm" htmlFor={option.label}>{option.label}</label>
                </div>
              ))}

              {/* Display selected items */}
              {/* <div>
              <h3>Selected Items:</h3>
              <pre>{JSON.stringify(checkedCommonTags, null, 2)}</pre>
            </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideFilters;
