import { useBrowsingStore } from "../store/useBrowsingStore";

interface FilterFooterProps {
    toggleFilters: () => void;
  }

const FilterFooter: React.FC<FilterFooterProps> = ({ toggleFilters }) => {
    const {getSuggestions} = useBrowsingStore();

    const showResults = () => {
        getSuggestions()
    }
    return (
      <div className="flex h-full items-end">
        <div className="p-4 border-t w-full border-purple-200 text-sm justify-end flex">
          {/* <button className="p-3 border rounded-md">Clear Filter</button> */}
          <button onClick={showResults} className="py-3  px-4 border rounded-lg text-white bg-purple-500">
            Show results
          </button>
        </div>
      </div>
    );
  };
  
  export default FilterFooter;