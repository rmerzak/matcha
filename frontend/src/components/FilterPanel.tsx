import FilterHeader from "./FilterHeader";
import FilterSidebar from "./FilterSidebar";
import FilterContent from "./FilterContent";
import FilterFooter from "./FilterFooter";

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
        <FilterHeader toggleFilters={toggleFilters} />
        <div className="flex w-full">
          <FilterSidebar
            filter={filter}
            setFilter={setFilter}
            filterItems={filterItems}
          />
          <FilterContent
            filter={filter}
            ageRangeValues={ageRangeValues}
            frRangeValues={frRangeValues}
            handleAgeRangeChange={handleAgeRangeChange}
            handleFrRangeChange={handleFrRangeChange}
            onSortChange={(newSelection) => {
              console.log("Sort changed to:", newSelection);
            }}
          />
        </div>
        <FilterFooter toggleFilters={toggleFilters} />
      </div>
    </div>
  );
};

export default FilterPanel;
