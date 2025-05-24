import { useState } from "react";
import { useBrowsingStore } from "../store/useBrowsingStore";

interface SortByProps {
  selectedSort?: string | null;
  onSortChange?: (selected: string | null) => void;
}

function SortBy({
  onSortChange,
}: SortByProps) {
  const { sortBy, setSortBy, setSortOrder } = useBrowsingStore();
  const [selectedSort, setSelectedSort] = useState<string | null>(sortBy);

  const sortByItems = [
    "Age: Low to High",
    "Age: High to Low",
    "Location",
    "Fame rating: Low to High",
    "Fame rating: High to Low",
    "Common tags",
  ];

  const handleSortSelect = (item: string) => {
    const newSelection = item === selectedSort ? null : item;
    setSelectedSort(newSelection);
    if (onSortChange) {
      onSortChange(newSelection);
      console.log(newSelection);
      if (!newSelection) {
        setSortBy(null);
        setSortOrder(null);
      }
      else if (newSelection == "Age: Low to High") {
        setSortBy("age");
        setSortOrder("asc");
      }
      else if (newSelection == "Age: High to Low") {
        setSortBy("age");
        setSortOrder("desc");
      }
    }
  };

  return (
    <span className="flex flex-wrap">
      {sortByItems.map((item, index) => (
        <button
          key={index}
          onClick={() => handleSortSelect(item)}
          className={`border p-2 rounded-lg w-fit mb-2 mr-2 ${
            selectedSort === item
              ? "bg-purple-500 text-white border-purple-500"
              : "border-gray-200 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <div className="flex mb-0 items-center">
            <span className="text-xs">{item}</span>
          </div>
        </button>
      ))}
    </span>
  );
}

export default SortBy;
