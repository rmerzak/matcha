import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const options = [
  "Suggestions",
  "Age: Low to High",
  "Age: Hight to Low",
  "Location",
  "Fame rating: Low to High",
  "Fame rating: High to Low",
  "Common tags",
];
export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Suggestions");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = (value: any) => () => {
    setSelectedOption(value);
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
    gap-1 font-semibold lg:inline-flex "
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
            {options.map((option) => (
              <div>
                <button
                  type="button"
                  onClick={onOptionClicked(option)}
                  key={Math.random()}
                  className={`w-full px-4 py-1 text-xs text-black no-underline hover:bg-gray-100
                  text-start ${
                    option === selectedOption
                      ? "border-2 border-purple-500 bg-purple-50"
                      : ""
                  }`}
                >
                  {option}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
