import { Search } from "lucide-react";
import { useState } from "react";
import Dropdown from "./Dropdown";
import { Link } from "react-router-dom";
import FilterButton from "./FilterButton"; // Already imported
import FilterPanel from "./FilterPanel"; // Import the new component

function Filters() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilters = () => setIsOpen(!isOpen);

  const [filter, setFilter] = useState("Age");
  const filterItems = [
    "Age",
    "Location",
    "Fame rating",
    "Common tags",
    "Sort by",
  ];

  const [ageRangeValues, setAgeRangeValues] = useState({ min: 18, max: 80 });
  const [frRangeValues, setFrRangeValues] = useState({ min: 4, max: 10 });

  const handleAgeRangeChange = (value: any) => {
    setAgeRangeValues(value);
  };

  const handleFrRangeChange = (value: any) => {
    setFrRangeValues(value); 
  };

  return (
    <div className="flex divide-x divide-gray-400 border-b border-gray-400 justify-between">
      <div className="w-full flex justify-center items-center">
        <Link
          to="/search"
          className="text-sm px-6 py-2 text-purple-700 flex items-center gap-1 font-semibold justify-center hover:underline"
        >
          <Search size={18} />
          Advanced search
        </Link>
      </div>
      <FilterPanel
        isOpen={isOpen}
        toggleFilters={toggleFilters}
        filter={filter}
        setFilter={setFilter}
        filterItems={filterItems}
        ageRangeValues={ageRangeValues}
        frRangeValues={frRangeValues}
        handleAgeRangeChange={handleAgeRangeChange}
        handleFrRangeChange={handleFrRangeChange}
      />
      <FilterButton onClick={toggleFilters} isOpen={isOpen} />
      <Dropdown />
    </div>
  );
}

export default Filters;