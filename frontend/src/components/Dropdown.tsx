import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBrowsingStore } from "../store/useBrowsingStore";

const options = [
  "Suggestions",
  "Age: Low to High",
  "Age: High to Low",
  "Fame rating: Low to High",
  "Fame rating: High to Low",
  "Location: Low to High",
  "Location: High to Low",
  "Common tags",
];

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Suggestions");
  const { setSortBy, setSortOrder, getSuggestions } = useBrowsingStore();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = (value: any) => () => {
    setSelectedOption(value);
    if (value == "Suggestions") {
      setSortBy(null);
      setSortOrder(null);
    } else if (value == "Age: Low to High") {
      setSortBy("age");
      setSortOrder("asc");
    } else if (value == "Age: High to Low") {
      setSortBy("age");
      setSortOrder("desc");
    } else if (value == "Fame rating: High to Low") {
      setSortBy("fame_rating");
      setSortOrder("desc");
    } else if (value == "Fame rating: Low to High") {
      setSortBy("fame_rating");
      setSortOrder("asc");
    } else if (value == "Location: High to Low") {
      setSortBy("distance");
      setSortOrder("desc");
    } else if (value == "Location: Low to High") {
      setSortBy("distance");
      setSortOrder("asc");
    }
    getSuggestions();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutsie = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsie);
    return () => document.removeEventListener("mousedown", handleClickOutsie);
  }, []);

  return (
    <div
      className="hidden text-sm  lg:hover:bg-purple-200 text-purple-700 items-center 
    gap-1 font-semibold lg:inline-flex shrink-0 "
    >
      <div className=" relative inline-flex" ref={dropdownRef}>
        <button
          onClick={toggling}
          className="w-full rounded-l-md px-6 py-2  flex justify-center items-center gap-1"
        >
          {"Sort by:   " + selectedOption || "  "}
          <ChevronDown className="size-4" />
        </button>
        {isOpen && (
          <div
            className="absolute top-5 right-4 z-10 mt-4 min-w-[200px] origin-top-right rounded-md
                         bg-white shadow-lg"
          >
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={onOptionClicked(option)}
                className={`w-full px-4 py-1 text-xs text-black no-underline hover:bg-gray-100
                  text-start ${
                    option === selectedOption
                      ? "border-2 border-purple-500 bg-purple-50"
                      : ""
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
