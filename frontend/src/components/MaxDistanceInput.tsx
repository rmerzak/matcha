import { useRef, useState } from "react";

interface Props {
  maxDistance: number ;
  onChange?: (maxDistance: number) => void;
}

function MaxDistanceInput({
  maxDistance,
  onChange,
}: Props): JSX.Element {
  const [maxVal, setMaxVal] = useState(maxDistance);
  const maxValRef = useRef(maxDistance);

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
      setMaxVal(value);
      maxValRef.current = value;
      // Call onChange directly
      if (onChange) {
        onChange(value);
      }
  };

  return (
    <span className="w-full flex items-center justify-center flex-col space-y-14 lg:space-y-5">
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-gray-600 font-medium">Max distance</p>
          <input
            type="number"
            min={0}
            value={maxVal}
            onChange={handleMaxInputChange}
            className="w-24 px-2 py-1 text-center text-sm font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
      </div>
    </span>
  );
}

export default MaxDistanceInput;
