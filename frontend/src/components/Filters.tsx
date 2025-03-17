import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import SortBy from "./SortBy";
import AgeRangeSlider from "./AgeRangeSlider";

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

  const [rangeValues, setRangeValues] = useState({min: 18, max:80})

  const handleRangeChange = (value: any) => {
    setRangeValues(value)
  }

  return (
    <div
      className="flex divide-x divide-gray-400 justify-end border-b border-gray-400
  lg:hidden"
    >
      <div></div>
      <div
        className={`
fixed inset-x-0 bottom-0 z-10 w-full h-5/6 bg-white shadow-md overflow-hidden transition-transform duration-300 ease-in-out
${isOpen ? "translate-x-0 z-20" : "translate-y-full"}
lg:hidden
`}
      >
        <div className="flex flex-col h-full ">
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
          <div className="flex w-full ">
            <div className="flex flex-col bg-[#f7fafa]  h-full flex-shrink-0 w-32 overflow-y-auto relative cursor-pointer">
              {filterItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setFilter(item)}
                  className="border-b border-[#e3e6e6] "
                >
                  <div
                    className={`${
                      filter === item
                        ? "border-l-purple-500 border-l-4 text-purple-500 font-semibold bg-white"
                        : ""
                    }  py-2 px-2 flex flex-row items-center min-h-12 justify-between`}
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
                      {filter === "Age" && <AgeRangeSlider min={18} max={80} onChange={handleRangeChange} />}
                      {filter === "Sort by" && <SortBy />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={toggleFilters}
        className="text-sm px-6  py-2 text-purple-700 flex items-center gap-1 font-semibold"
      >
        <span className="">Filters</span>
        <ChevronDown
          className={`${
            isOpen ? "rotate-180" : ""
          } transition-transform size-3`}
        />
      </button>
    </div>
  );
}

export default Filters;
