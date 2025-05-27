import { useCallback, useEffect, useRef, useState } from "react";
import { useBrowsingStore } from "../store/useBrowsingStore";

interface Props {
  min: any;
  max: any;
  trackColor?: any;
  onChange?: any;
  rangeColor?: any;
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
  trackColor = "#cecece",
  onChange,
  rangeColor = "#a855f7",
  // valueStyle = cssValues,
  width = "200px",
}: Props) {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const range: any = useRef(null);

  const { getSuggestions } = useBrowsingStore();

  // Convert to percentage
  const getPercent = useCallback(
    (value: any) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // set width of the range to decreas/increase from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // set width of the range to decreas/increase from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.right = `${maxPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Get min and max values when their state changes
  useEffect(() => {
    if (minVal != minValRef.current || maxVal != maxValRef.current) {
      onChange({ min: minVal, max: maxVal });
      minValRef.current = minVal;
      maxValRef.current = maxVal;
    }
  }, [minVal, maxVal, onChange]);

  return (
    <span className="w-full flex items-center justify-center flex-col space-y-14 lg:space-y-5">
      {/* Display the min and max values */}
      <div className="w-[200px] px-4 flex items-center justify-between gap-x-5">
        <p className="text-base lg:text-md text-black font-semibold">
          min: {minVal}
        </p>
        <div className="flex-1 border-dashed border border-neutral-500 mt-1"></div>
        <p className="text-base lg:text-md text-black font-semibold">
          max: {maxVal}
        </p>
      </div>

      {/* Stye the custom price range slider */}
      <div className="price_range_slider" style={{ width }}>
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={(e) => {
            const value = Math.min(Number(e.target.value), maxVal - 1);
            setMinVal(value);
          }}
          className="thumb thumb-left"
          style={{
            width,
            zIndex: minVal > max - 100 || minVal === maxVal ? 5 : undefined,
          }}
          onMouseUp={() => {
            console.log("test---->");
            getSuggestions();
          }}
        />
        <input
          onMouseUp={() => {
            console.log("test---->");
            getSuggestions();
          }}
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={(e) => {
            const value = Math.max(Number(e.target.value), minVal + 1);
            setMaxVal(value);
          }}
          className="thumb thumb-right"
          style={{
            width,
            zIndex: minVal > max - 100 || minVal === maxVal ? 4 : undefined,
          }}
        />

        <div className="slider">
          <div
            className="track-slider"
            style={{ backgroundColor: trackColor }}
          />
          <div
            className="range-slider"
            ref={range}
            style={{ backgroundColor: rangeColor }}
          />
        </div>
      </div>
    </span>
  );
}

export default AgeRangeSlider;
