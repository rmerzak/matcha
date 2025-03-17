
function SortBy() {
  const sortByItems = [
    "Age: Low to High",
    "Age: Hight to Low",
    "Location",
    "Fame rating: Low to High",
    "Fame rating: High to Low",
    "Common tags",
  ];
  return (
    <span className="flex flex-wrap">
      {sortByItems.map((item, index) => (
        <button
          key={index}
          className="border border-gray-200 p-2 rounded-lg w-fit mb-2 mr-2 "
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
