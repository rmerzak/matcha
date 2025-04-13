interface FilterSidebarProps {
    filter: string;
    setFilter: (value: string) => void;
    filterItems: string[];
  }
  
  const FilterSidebar: React.FC<FilterSidebarProps> = ({
    filter,
    setFilter,
    filterItems,
  }) => {
    return (
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
    );
  };
  
  export default FilterSidebar;