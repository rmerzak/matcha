import { useCallback, useEffect, useRef, useState } from "react";
import { useBrowsingStore } from "../store/useBrowsingStore";

interface Props {
  min: number;
  max: number;
  trackColor?: string;
  onChange?: (value: { min: number; max: number }) => void;
  rangeColor?: string;
  valueStyle?: any;
  width?: any;
  currencyText?: any;
}

// const cssValues = {
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   zIndex: 1,
//   gap: "2px",
//   paddingTop: "10px",
// };
function AgeRangeSlider({
  min,
  max,
  onChange,
  // valueStyle = cssValues,
}: Props) {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const range = useRef<HTMLDivElement>(null);

  const {  } = useBrowsingStore();

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value <= maxVal - 1) {
      setMinVal(value);
      minValRef.current = value;
      // Call onChange directly
      if (onChange) {
        onChange({ min: value, max: maxVal });
      }
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= minVal + 1) {
      setMaxVal(value);
      maxValRef.current = value;
      // Call onChange directly
      if (onChange) {
        onChange({ min: minVal, max: value });
      }
    }
  };

  return (
    <span className="w-full flex items-center justify-center flex-col space-y-14 lg:space-y-5">
      <div className="w-[200px] flex items-center justify-between">
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-gray-600 font-medium">Min</p>
          <input
            type="number"
            min={min}
            max={max}
            value={minVal}
            onChange={handleMinInputChange}
            className="w-16 px-2 py-1 text-center text-sm font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex-1 border-dashed border border-neutral-500 mt-6"></div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-gray-600 font-medium">Max</p>
          <input
            type="number"
            min={min}
            max={max}
            value={maxVal}
            onChange={handleMaxInputChange}
            className="w-16 px-2 py-1 text-center text-sm font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
    </span>
  );
}

export default AgeRangeSlider;
