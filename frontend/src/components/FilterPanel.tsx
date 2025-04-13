import { X } from "lucide-react";
import { useState } from "react";
import SortBy from "./SortBy";
import AgeRangeSlider from "./AgeRangeSlider";
import CommonTags from "./CommonTags";

// Define the props interface for the filter panel
interface FilterPanelProps {
  isOpen: boolean;
  toggleFilters: () => void;
  filter: string;
  setFilter: (value: string) => void;
  filterItems: string[];
  ageRangeValues: { min: number; max: number };
  frRangeValues: { min: number; max: number };
  handleAgeRangeChange: (value: any) => void;
  handleFrRangeChange: (value: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  toggleFilters,
  filter,
  setFilter,
  filterItems,
  ageRangeValues,
  frRangeValues,
  handleAgeRangeChange,
  handleFrRangeChange,
}) => {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-10 w-full h-5/6 bg-white shadow-md overflow-hidden transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0 z-20" : "translate-y-full"
      } lg:hidden`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-purple-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-black">Filters</h2>
          <button
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={toggleFilters}
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex w-full">
          <div className="flex flex-col bg-[#f7fafa] h-full flex-shrink-0 w-32 overflow-y-auto relative cursor-pointer">
            {filterItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setFilter(item)}
                className="border-b border-[#e3e6e6]"
              >
                <div
                  className={`${
                    filter === item
                      ? "border-l-purple-500 border-l-4 text-purple-500 font-semibold bg-white"
                      : ""
                  } py-2 px-2 flex flex-row items-center min-h-12 justify-between`}
                >
                  <span className="">{item}</span>
                </div>
              </button>
            ))}
          </div>
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
                    {filter === "Sort by" && <SortBy />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-full items-end">
          <div className="p-4 border-t w-full border-purple-200 text-sm justify-between flex">
            <button className="p-3 border rounded-md">Clear Filter</button>
            <button className="py-3 px-4 border rounded-lg text-white bg-purple-500">
              Show results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
