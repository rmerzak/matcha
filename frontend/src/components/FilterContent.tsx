import { useState } from "react";
import SortBy from "./SortBy";
import AgeRangeSlider from "./AgeRangeSlider";
import CommonTags from "./CommonTags";

interface FilterContentProps {
    filter: string;
    ageRangeValues: { min: number; max: number };
    frRangeValues: { min: number; max: number };
    handleAgeRangeChange: (value: any) => void;
    handleFrRangeChange: (value: any) => void;
    onSortChange?: (selected: string | null) => void; // New optional prop
  }

const FilterContent: React.FC<FilterContentProps> = ({
  filter,
  handleAgeRangeChange,
  handleFrRangeChange,
}) => {
  const [selectedSort, setSelectedSort] = useState<string | null>(null);


  const handleSortChange = (newSelection: string | null) => {
    setSelectedSort(newSelection);
  };

  return (
    <div className="overflow-y-auto pt-3 w-full mb-0">
      <div className="mb-0">
        <div className="mx-3">
          <div className="overflow-auto">
            <div className="mb-2">
              {filter === "Age" && (
                <AgeRangeSlider
                  min={18}
                  max={80}
                  onChange={handleAgeRangeChange}
                />
              )}
              {filter === "Fame rating" && (
                <AgeRangeSlider
                  min={4}
                  max={10}
                  onChange={handleFrRangeChange}
                />
              )}
              {filter === "Common tags" && <CommonTags />}
              {filter === "Sort by" && (
                <SortBy
                  selectedSort={selectedSort} 
                  onSortChange={handleSortChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterContent;