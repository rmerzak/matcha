import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import SortBy from "./SortBy";
import AgeRangeSlider from "./AgeRangeSlider";
import CommonTags from "./CommonTags";
import Dropdown from "./Dropdown";
import useAuthStore from "../store/useAuthStore";

interface CheckedItems {
  [key: string]: boolean;
}


function SideFilters() {
  const { authUser } = useAuthStore();
  const [ageRangeValues, setAgeRangeValues] = useState({ min: 18, max: 80 });
  const [frRangeValues, setFrRangeValues] = useState({ min: 4, max: 10 });

  const [checkedCommonTags, setCheckedCommonTags] = useState<CheckedItems>({});

  const handleChange = (event: any) => {
    setCheckedCommonTags({
      ...checkedCommonTags,
      [event.target.name]: event.target.checked,
    });
  };

  const handleAgeRangeChange = (value: any) => {
    setAgeRangeValues(value);
  };

  const handleFrRangeChange = (value: any) => {
    setAgeRangeValues(value);
  };

  return (
    <div className="hidden lg:block border-r border-gray-400">
      <div className="py-2 px-4 flex flex-col space-y-2 ">
        <h2 className="text-lg font-semibold text-purple-600">Filters</h2>
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold">Age</h3>
            <AgeRangeSlider min={18} max={80} onChange={handleAgeRangeChange} />
          </div>
          <div>
            <h3 className="text-base font-bold">Location</h3>
          </div>
          <div>
            <h3 className="text-base font-bold">Fame rating</h3>
            <AgeRangeSlider min={4} max={10} onChange={handleFrRangeChange} />
          </div>
          <div>
            <h3 className="text-base font-bold">Common tags</h3>
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
                  <label className="text-sm" htmlFor={option.label}>{option.label}</label>
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
