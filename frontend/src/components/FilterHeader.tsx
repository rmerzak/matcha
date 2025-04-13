import { X } from "lucide-react";

interface FilterHeaderProps {
  toggleFilters: () => void;
}

const FilterHeader: React.FC<FilterHeaderProps> = ({ toggleFilters }) => {
  return (
    <div className="p-4 border-b border-purple-200 flex justify-between items-center">
      <h2 className="text-lg font-semibold text-black">Filters</h2>
      <button
        className="lg:hidden p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={toggleFilters}
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default FilterHeader;