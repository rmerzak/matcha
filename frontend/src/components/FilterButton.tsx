import { ChevronDown } from "lucide-react";

// Define the props interface for the button
interface FilterButtonProps {
  onClick: () => void; // Function to toggle the filters
  isOpen: boolean; // State to determine if the filters are open
}

const FilterButton: React.FC<FilterButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="text-sm px-6 py-2 text-purple-700 flex items-center gap-1 font-semibold lg:hidden"
    >
      <span className="">Filters</span>
      <ChevronDown
        className={`${
          isOpen ? "rotate-180" : ""
        } transition-transform size-3`}
      />
    </button>
  );
};

export default FilterButton;