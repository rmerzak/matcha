import React from "react";
import CreatableSelect from "react-select/creatable"; // Import CreatableSelect
import clsx from "clsx";

interface InterestsSelectProps {
  interests: { value: string; label: string }[];
  setInterests: (interests: { value: string; label: string }[]) => void;
  options: { value: string; label: string }[];
}

const InterestsSelect: React.FC<InterestsSelectProps> = ({
  interests,
  setInterests,
  options,
}) => {
  // Define styles within the component
  const controlStyles = {
    base: "border rounded-lg bg-white hover:cursor-pointer",
    focus: "ring-1 ring-purple-700",
    nonFocus: "border-gray-300 hover:border-gray-400",
  };
  const placeholderStyles = "text-gray-500 pl-1 py-0.5 text-sm";
  const selectInputStyles = "pl-1 py-0.5";
  const valueContainerStyles = "p-1 gap-1";
  const singleValueStyles = "leading-7 ml-1";
  const multiValueStyles =
    "bg-gray-100 rounded items-center py-0.5 pl-2 pr-1 gap-1.5";
  const multiValueLabelStyles = "leading-6 py-0.5";
  const multiValueRemoveStyles =
    "border border-gray-200 bg-white hover:bg-red-50 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md";
  const indicatorsContainerStyles = "p-1 gap-1";
  const clearIndicatorStyles =
    "text-gray-500 p-1 rounded-md hover:bg-red-50 hover:text-red-800";
  const indicatorSeparatorStyles = "bg-gray-300";
  const dropdownIndicatorStyles =
    "p-1 hover:bg-gray-100 text-gray-500 rounded-md hover:text-black";
  const menuStyles = "p-1 mt-2 border border-purple-200 bg-white rounded-lg";
  const groupHeadingStyles = "ml-3 mt-2 mb-1 text-gray-500 text-sm";
  const optionStyles = {
    base: "hover:cursor-pointer px-3 py-2 rounded",
    focus: "bg-gray-100 active:bg-gray-200",
    selected:
      "after:content-['✔'] after:ml-2 after:text-green-500 text-gray-500",
  };
  const noOptionsMessageStyles =
    "text-gray-500 p-2 bg-gray-50 border border-dashed border-gray-200 rounded-sm";

  // Handle creation of new options
  const handleChange = (
    newValue: any,
    actionMeta: any
  ) => {
    setInterests(newValue || []);
  };

  // Format new tags with a hashtag if not already present
  const createOption = (inputValue: string) => {
    const formattedValue = inputValue.startsWith("#")
      ? inputValue
      : `#${inputValue}`;
    return {
      label: formattedValue,
      value: formattedValue.slice(1), // Store value without the hashtag
    };
  };

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 mb-2">
        Interests
      </span>
      <div>
        <CreatableSelect
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          unstyled
          styles={{
            input: (base) => ({
              ...base,
              "input:focus": {
                boxShadow: "none",
              },
            }),
            multiValueLabel: (base) => ({
              ...base,
              whiteSpace: "normal",
              overflow: "visible",
            }),
            control: (base) => ({
              ...base,
              transition: "none",
            }),
          }}
          classNames={{
            control: ({ isFocused }) =>
              clsx(
                isFocused ? controlStyles.focus : controlStyles.nonFocus,
                controlStyles.base
              ),
            placeholder: () => placeholderStyles,
            input: () => selectInputStyles,
            valueContainer: () => valueContainerStyles,
            singleValue: () => singleValueStyles,
            multiValue: () => multiValueStyles,
            multiValueLabel: () => multiValueLabelStyles,
            multiValueRemove: () => multiValueRemoveStyles,
            indicatorsContainer: () => indicatorsContainerStyles,
            clearIndicator: () => clearIndicatorStyles,
            indicatorSeparator: () => indicatorSeparatorStyles,
            dropdownIndicator: () => dropdownIndicatorStyles,
            menu: () => menuStyles,
            groupHeading: () => groupHeadingStyles,
            option: ({ isFocused, isSelected }) =>
              clsx(
                isFocused && optionStyles.focus,
                isSelected && optionStyles.selected,
                optionStyles.base
              ),
            noOptionsMessage: () => noOptionsMessageStyles,
          }}
          value={interests}
          onChange={handleChange}
          options={options}
          formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
          createOptionPosition="last"
          placeholder="Select or type interests..."
          onCreateOption={(inputValue) => {
            const newOption = createOption(inputValue);
            setInterests([...interests, newOption]);
          }}
        />
      </div>
    </div>
  );
};

export default InterestsSelect;